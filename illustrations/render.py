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


# ——— Shape: SVG → thick, softly rounded solid ———
FORMS = {
    # thickness as a share of the width, and how much the edges round off (smoothing passes)
    'slab': {'thickness': 0.16, 'smooth': 18},
    'puffy': {'thickness': 0.32, 'smooth': 140},
}


def import_svg(path):
    """Every path or shape in the SVG comes in as its own curve. They stay separate until they are solid, then merge,
    so overlapping pieces (an asterisk's bars) join up instead of cutting holes in each other."""
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=path)
    curves = [o for o in bpy.data.objects if o not in before and o.type == 'CURVE']
    if not curves:
        raise SystemExit(f'No shapes found in {path}')
    for curve in curves:
        curve.data.dimensions = '3D'  # 2D curves refuse to have their transform applied
    return curves


MAX_FACES = 1_500_000  # a guard: past this, something is mis-scaled; stop rather than exhaust memory


def solidify(curves, thickness, smooth, voxel):
    """Fill each flat outline and give it thickness, merge the pieces, then remesh and smooth the result so any outline
    (sharp points included) rounds off evenly. Thickness goes on as a mesh modifier: the SVG importer keeps a hidden
    scale on curve data that would otherwise multiply a curve extrude."""
    for obj in curves:
        curve = obj.data
        curve.dimensions = '2D'
        curve.fill_mode = 'BOTH'
        curve.extrude = 0
        curve.resolution_u = 24
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.convert(target='MESH')
        solid = obj.modifiers.new('thickness', 'SOLIDIFY')
        solid.thickness = thickness
        solid.offset = 0
        bpy.ops.object.modifier_apply(modifier='thickness')
    bpy.ops.object.select_all(action='DESELECT')
    for obj in curves:
        obj.select_set(True)
    obj = curves[0]
    bpy.context.view_layer.objects.active = obj
    if len(curves) > 1:
        bpy.ops.object.join()
    depth = obj.dimensions.z
    if not 0.5 * thickness < depth < 2 * thickness:
        raise SystemExit(f'Shape came out {depth:.3f} thick instead of {thickness:.3f}; check the SVG')
    remesh = obj.modifiers.new('remesh', 'REMESH')  # also welds overlapping pieces into one surface
    remesh.mode = 'VOXEL'
    remesh.voxel_size = voxel
    bpy.ops.object.modifier_apply(modifier='remesh')
    if len(obj.data.polygons) > MAX_FACES:
        raise SystemExit(f'Remesh made {len(obj.data.polygons):,} faces; stopping before it runs out of memory')
    soften = obj.modifiers.new('soften', 'LAPLACIANSMOOTH')
    soften.iterations = smooth
    soften.lambda_factor = 1.0
    soften.lambda_border = 0.0
    soften.use_volume_preserve = True
    soften.use_normalized = True
    bpy.ops.object.modifier_apply(modifier='soften')
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


def build(spec):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    form = FORMS[spec.get('form', 'puffy')]
    parts = []
    for part in spec['parts']:
        parts.append((import_svg(os.path.join(HERE, 'shapes', part['svg'])), part))
    every = [c for curves, _ in parts for c in curves]

    # One scale for every part (they share a viewBox), so the widest part is 2 units across.
    lo, hi = bounds(every)
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
        thickness = form['thickness'] * part.get('depth', 1.0) * 2
        obj = solidify(curves, thickness, int(form['smooth'] * part.get('depth', 1.0)), voxel=0.012)
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
