"""Render a Femoskeydev 3D illustration with Blender, following DIRECTION.md.

    blender -b --factory-startup --python illustrations/render.py -- illustrations/specs/academy-icon.json [--size 2048] [--samples 128]

A spec names one or more flat SVG shapes (drawn on the same viewBox), and for each a material and tone. The script
owns everything else: thickness and rounding, the studio lighting, the camera angle and the soft contact shadow, so
every illustration matches. Output is a transparent PNG in illustrations/out/.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))

# ——— Palette (DIRECTION.md) ———
TONES = {
    'mint': (0x7E, 0xE8, 0xA0), 'blue': (0x5B, 0x7B, 0xF0), 'violet': (0x8F, 0x6B, 0xF0), 'peach': (0xFF, 0x9E, 0x6E),
    'yellow': (0xFF, 0xD8, 0x5C), 'ink': (0x1A, 0x1A, 0x1A), 'white': (0xF4, 0xF6, 0xF5), 'clear': (0xFF, 0xFF, 0xFF),
}


def linear(rgb):
    """sRGB 0–255 to linear 0–1, as Blender's colour inputs expect."""
    def channel(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (*[channel(c) for c in rgb], 1.0)


# ——— Shape: SVG outline → a solid with the exact silhouette, flat faces and evenly rounded rims ———
#
# The solid is described as a signed distance field, a "rounded extrusion" of the outline: at every point in space,
# how far it is from the surface. Blender builds the mesh from that. The silhouette is exact, every rim gets the same
# round, and where the shape is thinner than the round (a sliver, a point) it simply tapers. Nothing is smoothed by
# trial and error, so there are no lumps or melted points.
FORMS = {
    # In scene units (shapes are 2 across): thickness at the edge, the rim's round, and how much the faces dome up
    # towards the middle (puff) over what distance from the edge (reach). A tight rim keeps silhouettes and points
    # crisp; the dome gives the inflated feel.
    'slab': {'thickness': 0.30, 'radius': 0.07, 'puff': 0.0, 'reach': 0.3},
    'puffy': {'thickness': 0.24, 'radius': 0.09, 'puff': 0.16, 'reach': 0.45},
}
VOXEL = 0.0045  # surface detail, in scene units; shapes are 2 units across
MAX_FACES = 3_000_000


def form_thickness(form):
    return form['thickness']  # a guard: past this, something is mis-scaled; stop rather than exhaust memory


def import_svg(path):
    """Every path or shape in the SVG comes in as its own curve; together they are one part's outline."""
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=path)
    curves = [o for o in bpy.data.objects if o not in before and o.type == 'CURVE']
    if not curves:
        raise SystemExit(f'No shapes found in {path}')
    for curve in curves:
        curve.data.dimensions = '3D'  # 2D curves refuse to have their transform applied
    return curves


def outline_loops(curves):
    """The outline as closed polygons (x, y), sampled finely from the curves."""
    import numpy as np
    loops = []
    for obj in curves:
        obj.data.dimensions = '2D'
        obj.data.fill_mode = 'NONE'
        obj.data.resolution_u = 48
        depsgraph = bpy.context.evaluated_depsgraph_get()
        mesh = obj.evaluated_get(depsgraph).to_mesh()
        nxt = {}
        for e in mesh.edges:
            a, b = e.vertices
            nxt.setdefault(a, []).append(b)
            nxt.setdefault(b, []).append(a)
        seen = set()
        for start in nxt:
            if start in seen:
                continue
            loop, prev, cur = [], None, start
            while cur not in seen:
                seen.add(cur)
                co = obj.matrix_world @ mesh.vertices[cur].co
                loop.append((co.x, co.y))
                options = [n for n in nxt[cur] if n != prev]
                if not options:
                    break
                prev, cur = cur, options[0]
            if len(loop) > 2:
                loops.append(np.array(loop, dtype=np.float64))
        obj.evaluated_get(depsgraph).to_mesh_clear()
    return loops


def outline_segments(curves):
    """Every edge of the curves as a segment ((x0, y0), (x1, y1)): open lines too, for stroked parts."""
    import numpy as np
    segments = []
    for obj in curves:
        obj.data.dimensions = '2D'
        obj.data.fill_mode = 'NONE'
        obj.data.resolution_u = 48
        depsgraph = bpy.context.evaluated_depsgraph_get()
        mesh = obj.evaluated_get(depsgraph).to_mesh()
        co = [obj.matrix_world @ v.co for v in mesh.vertices]
        segments += [((co[a].x, co[a].y), (co[b].x, co[b].y)) for a, b in (e.vertices for e in mesh.edges)]
        obj.evaluated_get(depsgraph).to_mesh_clear()
    return np.array(segments, dtype=np.float64)


def stroke_distance(segments, half_width, xs, ys):
    """Signed 2D distance to a round-capped stroke of the lines: negative within half_width of them."""
    import numpy as np
    px, py = np.meshgrid(xs, ys, indexing='ij')
    dist = np.full(px.shape, np.inf)
    for (ax, ay), (bx, by) in segments:
        ex, ey = bx - ax, by - ay
        length2 = ex * ex + ey * ey or 1e-12
        t = np.clip(((px - ax) * ex + (py - ay) * ey) / length2, 0, 1)
        dx, dy = px - (ax + t * ex), py - (ay + t * ey)
        np.minimum(dist, np.sqrt(dx * dx + dy * dy), out=dist)
    return dist - half_width


def outline_distance(loops, xs, ys):
    """Signed 2D distance to the outline on a grid: negative inside. Holes count by the even-odd rule."""
    import numpy as np
    px, py = np.meshgrid(xs, ys, indexing='ij')
    dist = np.full(px.shape, np.inf)
    inside = np.zeros(px.shape, dtype=bool)
    for loop in loops:
        a = loop
        b = np.roll(loop, -1, axis=0)
        for (ax, ay), (bx, by) in zip(a, b):
            ex, ey = bx - ax, by - ay
            length2 = ex * ex + ey * ey or 1e-12
            t = np.clip(((px - ax) * ex + (py - ay) * ey) / length2, 0, 1)
            dx, dy = px - (ax + t * ex), py - (ay + t * ey)
            np.minimum(dist, np.sqrt(dx * dx + dy * dy), out=dist)
            crosses = ((ay > py) != (by > py)) & (px < (bx - ax) * (py - ay) / ((by - ay) or 1e-12) + ax)
            inside ^= crosses
    return np.where(inside, -dist, dist)


def solidify(curves, thickness, form, name, stroke=0.0):
    """Build the part's solid from its outline (or, given a stroke width, from its lines drawn with round caps): a
    rounded extrusion, meshed from a distance field."""
    import numpy as np
    import openvdb
    import tempfile
    if stroke:
        segments = outline_segments(curves)
        loops = [segments.reshape(-1, 2) - stroke / 2, segments.reshape(-1, 2) + stroke / 2]  # bounds only
    else:
        loops = outline_loops(curves)
    for obj in curves:
        bpy.data.objects.remove(obj)
    half = thickness / 2
    radius = min(form['radius'], half)
    puff = form['puff'] * thickness / form_thickness(form)
    lo = np.min([l.min(axis=0) for l in loops], axis=0) - 0.05
    hi = np.max([l.max(axis=0) for l in loops], axis=0) + 0.05
    xs = np.arange(lo[0], hi[0], VOXEL)
    ys = np.arange(lo[1], hi[1], VOXEL)
    zs = np.arange(-half - puff - 0.05, half + puff + 0.05, VOXEL)
    d2 = (stroke_distance(segments, stroke / 2, xs, ys) if stroke else outline_distance(loops, xs, ys))[:, :, None]
    # Rounded extrusion: shrink the outline by the radius, extrude to the inner height, then round by the radius.
    # The inner height grows towards the middle of the shape (an eased dome), which puffs the faces.
    depth_in = np.clip(-d2 / form['reach'], 0, 1)
    dome = puff * (1 - (1 - depth_in) ** 2)
    wx = d2 + radius
    wy = np.abs(zs)[None, None, :] - (half - radius + dome)
    outside = np.sqrt(np.maximum(wx, 0) ** 2 + np.maximum(wy, 0) ** 2)
    sdf = (np.minimum(np.maximum(wx, wy), 0) + outside - radius).astype(np.float32)
    # Blender meshes a density grid: store 1 inside, 0 outside and a thin linear ramp across the surface (so it is
    # placed between voxels precisely), and leave empty space as inactive background.
    band = 2.5 * VOXEL
    density = np.clip(0.5 - sdf / (2 * band), 0.0, 1.0).astype(np.float32)
    grid = openvdb.FloatGrid()
    grid.copyFromArray(density, tolerance=1e-6)
    grid.name = 'density'
    grid.transform = openvdb.createLinearTransform(voxelSize=VOXEL)
    path = os.path.join(tempfile.gettempdir(), f'fmk-{name}.vdb')
    openvdb.write(path, grids=[grid])
    bpy.ops.object.volume_import(filepath=path, align='WORLD', location=(0, 0, 0))
    volume = bpy.context.active_object
    volume.location = (lo[0], lo[1], zs[0])
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    to_mesh = obj.modifiers.new('surface', 'VOLUME_TO_MESH')
    to_mesh.object = volume
    to_mesh.grid_name = 'density'
    to_mesh.resolution_mode = 'GRID'
    to_mesh.threshold = 0.5
    to_mesh.adaptivity = 0.0
    to_mesh.use_smooth_shade = True
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier='surface')
    bpy.data.objects.remove(volume)
    os.remove(path)
    if not len(obj.data.polygons):
        raise SystemExit(f'{name} came out empty; check the SVG outline')
    if len(obj.data.polygons) > MAX_FACES:
        raise SystemExit(f'{name} made {len(obj.data.polygons):,} faces; stopping before it runs out of memory')
    depth = obj.dimensions.z
    if not 0.8 * thickness < depth < 1.2 * (thickness + 2 * puff):
        raise SystemExit(f'{name} came out {depth:.3f} thick instead of {thickness:.3f}; check the SVG')
    bpy.ops.object.shade_smooth()
    return obj


# ——— Materials (DIRECTION.md: vinyl, jelly, glass, frosted) ———

def material(kind, tone):
    rgb = TONES[tone]
    base = linear(rgb)
    mat = bpy.data.materials.new(f'{kind}-{tone}')
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes['Principled BSDF']
    out = nodes['Material Output']
    s = bsdf.inputs
    s['Base Color'].default_value = base
    if kind == 'vinyl':
        s['Roughness'].default_value = 0.28 if tone != 'ink' else 0.2
        s['Subsurface Weight'].default_value = 0.0 if tone == 'ink' else 0.12
        s['Subsurface Radius'].default_value = (0.4, 0.3, 0.25)
        s['Coat Weight'].default_value = 0.55
        s['Coat Roughness'].default_value = 0.1
        s['Sheen Weight'].default_value = 0.15
    elif kind == 'jelly':
        s['Roughness'].default_value = 0.12
        s['Transmission Weight'].default_value = 0.92
        s['IOR'].default_value = 1.38
        s['Coat Weight'].default_value = 0.6
        s['Coat Roughness'].default_value = 0.05
        absorb = nodes.new('ShaderNodeVolumeAbsorption')
        absorb.inputs['Color'].default_value = base
        absorb.inputs['Density'].default_value = 2.2
        links.new(absorb.outputs[0], out.inputs['Volume'])
        s['Base Color'].default_value = linear(tuple(min(255, c + 60) for c in rgb))
    elif kind == 'glass':
        s['Base Color'].default_value = (1, 1, 1, 1)
        s['Roughness'].default_value = 0.02
        s['Transmission Weight'].default_value = 1.0
        s['IOR'].default_value = 1.45
        s['Thin Film Thickness'].default_value = 420.0  # the rainbow edges
        s['Thin Film IOR'].default_value = 1.35
        if tone != 'clear':
            absorb = nodes.new('ShaderNodeVolumeAbsorption')
            absorb.inputs['Color'].default_value = base
            absorb.inputs['Density'].default_value = 2.4
            links.new(absorb.outputs[0], out.inputs['Volume'])
    elif kind == 'frosted':
        s['Base Color'].default_value = linear(tuple(min(255, c + 70) for c in rgb))
        s['Roughness'].default_value = 0.38
        s['Transmission Weight'].default_value = 1.0
        s['IOR'].default_value = 1.45
        s['Thin Film Thickness'].default_value = 260.0
        s['Coat Weight'].default_value = 0.5
        s['Coat Roughness'].default_value = 0.08
        absorb = nodes.new('ShaderNodeVolumeAbsorption')
        absorb.inputs['Color'].default_value = base
        absorb.inputs['Density'].default_value = 1.6
        links.new(absorb.outputs[0], out.inputs['Volume'])
    else:
        raise SystemExit(f'Unknown material "{kind}": use vinyl, jelly, glass or frosted')
    return mat


# ——— Studio: soft key top left, cool rim right, low fill; bright neutral environment for reflections ———

def studio():
    world = bpy.data.worlds.new('studio')
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes['Background']
    coord = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = (0.82, 0.84, 0.86, 1)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
    map_range = nt.nodes.new('ShaderNodeMapRange')
    map_range.inputs['From Min'].default_value = -1
    nt.links.new(coord.outputs['Normal'], sep.inputs[0])
    nt.links.new(sep.outputs['Z'], map_range.inputs['Value'])
    nt.links.new(map_range.outputs['Result'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 1.05

    def area(name, loc, size, power, color=(1, 1, 1)):
        data = bpy.data.lights.new(name, 'AREA')
        data.shape = 'DISK'
        data.size = size
        data.energy = power
        data.color = color
        light = bpy.data.objects.new(name, data)
        light.location = loc
        bpy.context.collection.objects.link(light)
        direction = Vector((0, 0, 0)) - Vector(loc)
        light.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    area('key', (-4.5, -5.5, 6.5), 6.0, 900)
    area('rim', (5.5, 3.0, 3.0), 3.5, 420, (0.86, 0.92, 1.0))
    area('fill', (1.5, -7.0, 0.8), 6.0, 160)


# ——— Camera angles: three-quarter views, never straight on ———
ANGLES = {
    'hero': {'turn': -24, 'tilt': 14},
    'tilt': {'turn': 22, 'tilt': 12},
    'top': {'turn': -18, 'tilt': 42},
    'front': {'turn': -8, 'tilt': 6},
}


def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def svg_unit():
    """Scene units per SVG unit, as the importer brings shapes in: measured on a 32-unit square."""
    import tempfile
    path = os.path.join(tempfile.gettempdir(), 'fmk-unit.svg')
    with open(path, 'w') as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M0 0H32V32H0Z"/></svg>')
    curves = import_svg(path)
    lo, hi = bounds(curves)
    for obj in curves:
        bpy.data.objects.remove(obj)
    os.remove(path)
    return (hi.x - lo.x) / 32


def build(spec):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    unit = svg_unit()
    form = FORMS[spec.get('form', 'puffy')]
    parts = []
    for part in spec['parts']:
        parts.append((import_svg(os.path.join(HERE, 'shapes', part['svg'])), part))
    every = [c for curves, _ in parts for c in curves]

    # One scale for every part (they share a viewBox), so the widest part is 2 units across.
    lo, hi = bounds(every)
    # A stroked part reaches half its width past its lines.
    reach = max((p.get('stroke', 0) / 2 for _, p in parts), default=0) * unit
    lo, hi = lo - Vector((reach, reach, 0)), hi + Vector((reach, reach, 0))
    size = max(hi.x - lo.x, hi.y - lo.y)
    centre = (lo + hi) / 2
    factor = 2.0 / size
    for obj in every:
        obj.location = (obj.location - centre) * factor
        obj.scale = obj.scale * factor
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)

    root = bpy.data.objects.new('illustration', None)
    bpy.context.collection.objects.link(root)
    solids = []
    for curves, part in parts:
        thickness = form['thickness'] * part.get('depth', 1.0)
        stroke = part.get('stroke', 0) * unit * factor  # stroke width is in shape units, like the SVG's own
        obj = solidify(curves, thickness, form, f"part{len(solids)}", stroke)
        solids.append(obj)
        # lift is in shape units (the 32-unit grid): how far a part stands off the one behind it
        obj.location.z += part.get('lift', 0) * 2 / 32
        obj.data.materials.clear()  # the SVG importer leaves its own flat black fill
        obj.data.materials.append(material(part.get('material', 'vinyl'), part.get('tone', 'mint')))
        obj.parent = root

    # Stand it up, facing the camera, turned three-quarters.
    angle = ANGLES[spec.get('angle', 'hero')]
    root.rotation_euler = (math.radians(90 - angle['tilt']), 0, math.radians(angle['turn']))
    bpy.context.view_layer.update()

    lo, hi = bounds(solids)
    floor_z = lo.z - 0.04
    # Soft contact shadow: a shadow-catcher floor that renders only the shadow.
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, floor_z))
    floor = bpy.context.active_object
    floor.is_shadow_catcher = True

    studio()

    cam_data = bpy.data.cameras.new('camera')
    cam_data.lens = 85
    cam = bpy.data.objects.new('camera', cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    mid = (lo + hi) / 2
    extent = max(hi.x - lo.x, hi.z - lo.z) * 1.0
    fov = 2 * math.atan(cam_data.sensor_width / (2 * cam_data.lens))
    distance = extent / (2 * math.tan(fov / 2)) * spec.get('padding', 1.45)
    cam.location = (mid.x, mid.y - distance, mid.z + distance * 0.12)
    cam.rotation_euler = (Vector(mid) - cam.location).to_track_quat('-Z', 'Y').to_euler()


def render(spec, out, size, samples):
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for device in prefs.devices:
        device.use = True
    scene.cycles.device = 'GPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.transmission_bounces = 16
    scene.cycles.volume_bounces = 4
    scene.cycles.max_bounces = 24
    scene.render.film_transparent = True
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '16'
    scene.view_settings.view_transform = 'Standard'  # true brand colours; the soft lights keep highlights in range
    scene.view_settings.look = 'None'
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if not argv:
        raise SystemExit(__doc__)
    spec_path = argv[0]
    size = int(argv[argv.index('--size') + 1]) if '--size' in argv else 2048
    samples = int(argv[argv.index('--samples') + 1]) if '--samples' in argv else 128
    with open(spec_path) as f:
        spec = json.load(f)
    name = spec.get('name') or os.path.splitext(os.path.basename(spec_path))[0]
    out = os.path.join(HERE, 'out', f'{name}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(spec)
    render(spec, out, size, samples)
    print(f'Rendered {out}')


main()
