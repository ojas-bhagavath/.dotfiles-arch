import bpy
import math
import webbrowser
from mathutils import Matrix



class MRTS_sinewave(bpy.types.Operator):
    """... Draw a sine wave in blender!!! .."""    
    bl_idname = "object.mrts_sinewave"
    bl_label = ""
    bl_options = {'REGISTER', 'UNDO'}

    def visible_active_objmode_select(self, any_obj):
        any_obj.hide_set(False)
        bpy.context.view_layer.objects.active = any_obj
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='DESELECT')
        any_obj.select_set(True)

    def get_perspective_view_distance(self, context, area):
        view_distance = None
        was_ortho = False

        region_3d = area.spaces.active.region_3d
        if region_3d.view_perspective == 'ORTHO':
            was_ortho = True
            region_3d.view_perspective = 'PERSP'
        view_distance = region_3d.view_distance
        if was_ortho:
            region_3d.view_perspective = 'ORTHO'            

        return view_distance

    def execute(self, context):
        view_matrix = Matrix.Identity(4)
        for area in bpy.context.screen.areas:
            if area.type == 'VIEW_3D':
                view_matrix = area.spaces.active.region_3d.view_matrix
                view_distance = self.get_perspective_view_distance(context, area)
                break
        view_rotation_matrix = view_matrix.to_3x3().inverted()

        # Parameters for the sine wave
        amplitude = 100
        frequency = 1
        num_points = 100
        phase = 0
        scale = 2.0  # Scale the distance between points
        shift_x = amplitude * scale / 2

        sine_points = [(i * scale - shift_x, amplitude * math.sin(i * frequency * 2 * math.pi / (num_points-1) + phase), 0) for i in range(num_points)]
        # Create a new Grease Pencil object if it doesn't exist
        # gp_obj = None
        for obj in bpy.context.scene.objects:
            if obj.type == 'GPENCIL' and obj.name == "sine wave":
                # gp_obj = obj
                bpy.data.objects.remove(obj, do_unlink=True)
                break
        # if gp_obj is None:
        # Create a new Grease Pencil data-block

        #***************************************************************************************#
        bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection
        #***************************************************************************************#

        gp_data = bpy.data.grease_pencils.new("GPencil")
        gp_obj = bpy.data.objects.new("sine wave", gp_data)
        bpy.context.collection.objects.link(gp_obj)

        self.visible_active_objmode_select(gp_obj)

        # Ensure we're in object mode with the correct object active
        if bpy.context.active_object is not gp_obj:
            bpy.context.view_layer.objects.active = gp_obj
            gp_obj.select_set(True)
        bpy.ops.object.mode_set(mode='OBJECT')
        # Add a new Grease Pencil layer if it doesn't exist
        if "SineWaveLayer" not in gp_obj.data.layers:
            gp_layer = gp_obj.data.layers.new(name="SineWaveLayer", set_active=True)
        else:
            gp_layer = gp_obj.data.layers["SineWaveLayer"]
        # Create a new frame in the Grease Pencil layer or use the current one
        if not gp_layer.frames:
            gp_frame = gp_layer.frames.new(bpy.context.scene.frame_current)
        else:
            gp_frame = gp_layer.active_frame
        # Create a new stroke
        if not gp_frame.strokes:
            stroke = gp_frame.strokes.new()
            stroke.display_mode = '3DSPACE'  
            stroke.points.add(count=len(sine_points))  
            for i, point in enumerate(sine_points):
                stroke.points[i].co = point
            if not gp_obj.data.materials:
                mat = bpy.data.materials.new(name="GPencilMaterial")
                mat.line_color = [1.0, 0.0, 0.0, 1.0]  
                gp_obj.data.materials.append(mat)
            stroke.material_index = 0

        gp_obj.rotation_mode = 'XYZ'
        gp_obj.rotation_euler = view_rotation_matrix.to_euler()
        scale_factor = view_distance / 300
        gp_obj.scale = (scale_factor, scale_factor, scale_factor)
        bpy.context.view_layer.update()

        return {'FINISHED'}
