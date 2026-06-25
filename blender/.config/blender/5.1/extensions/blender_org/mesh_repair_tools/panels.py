import bpy
from bpy.props import *
from bpy.types import Operator, Panel


import os
import mathutils
import bpy.utils.previews
import sys
from bpy_extras.io_utils import ExportHelper
from mathutils import Vector

# Load custom icon
# main_dir = os.path.dirname(__file__) 
# icon_logo_path = os.path.join(main_dir, "sinewave.png")
# icon_collection = bpy.utils.previews.new()
# icon_collection.load("icon_logo", icon_logo_path, 'IMAGE')

############################################################################################################

class VIEW3D_PT_MeshFixLocalPanel(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_MeshFixLocalPanel"
    bl_label = "Local Fix"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Mesh Repair"
    #bl_options = {'DEFAULT_CLOSED'}  
    # # Note: All drawers are already closed by default

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def draw(self, context):
        layout = self.layout
        scene = context.scene
        props = scene.meshfixtool_properties
        space = bpy.context.space_data
        wiz_bool = props.wiz_boolean

        # Deprecated from 4.2
        # row = layout.row()
        # row.operator("object.flatten_local", text="Flatten Surface", icon ='HIDE_ON') 
        # row.prop(props, "bumper_reduction")

        #------ V2
        #layout.box()
        row = layout.row()
        row.operator("mesh.select_more", text="Select More", icon ='EVENT_PLUS')
        row.operator("mesh.select_less", text="Select Less", icon ='EVENT_MINUS')        

        # layout.separator()

        # row = layout.row()
        # col = row.column()        
        # col.prop(space.overlay, "show_face_orientation", text="Face Orientation")

        # col = row.column()
        # col.enabled = hasattr(space, 'overlay') and space.overlay.show_face_orientation
        # col.operator("object.local_face_normal", text="Unify/Flip Face", icon ='ORIENTATION_NORMAL')

        # col = row.column()

        # if hasattr(bpy.context.scene, "fix_wizard_properties") and wiz_bool: 
        #     col.operator("object.refind_local", text="Refine", icon ='KEYTYPE_KEYFRAME_VEC')
        # else:
        #     col.operator("object.refind_local", text="Refine", icon ='MESH_ICOSPHERE')       

        # row = layout.row()
        # if hasattr(bpy.context.scene, "fix_wizard_properties") and wiz_bool: 
        #     row.operator("object.remesh_local_v2", text="Remesh", icon ='KEYTYPE_KEYFRAME_VEC')
        # else:
        #     row.operator("object.remesh_local_v2", text="Remesh", icon ='MOD_REMESH')
        # row.operator("object.smooth_local_v2", text="Smooth", icon = 'MOD_SMOOTH')
        # row.operator("object.reduce_local", text="Decimate", icon = 'MOD_DECIM')



        has_wiz = hasattr(scene, "fix_wizard_properties") and wiz_bool
        row = layout.row()
        col = row.column()        
        col.prop(space.overlay, "show_face_orientation", text="Face Normal")

        col = row.column()
        col.enabled = hasattr(space, 'overlay') and space.overlay.show_face_orientation
        col.operator("object.local_face_normal", text="Unify/Flip", icon ='ORIENTATION_NORMAL')

        col = row.column()

        if has_wiz: 
            col.operator("object.refind_local", text="Refine", icon ='KEYTYPE_KEYFRAME_VEC')
        else:
            col.operator("object.refind_local", text="Refine", icon ='MESH_ICOSPHERE')       

        row = layout.row()
        if has_wiz: 
            row.operator("object.remesh_local_v2", text="Remesh", icon ='KEYTYPE_KEYFRAME_VEC')
        else:
            row.operator("object.remesh_local_v2", text="Remesh", icon ='MOD_REMESH')
        row.operator("object.smooth_local_v2", text="Smooth", icon = 'MOD_SMOOTH')
        row.operator("object.reduce_local", text="Reduce", icon = 'MOD_DECIM')


############################################################################################################

class VIEW3D_PT_MeshFixGlobalPanel(bpy.types.Panel):
    bl_idname = "VIEW3D_PT_MeshFixGlobalPanel"
    bl_label = "Global Fix"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Mesh Repair"
    #bl_options = {'DEFAULT_CLOSED'}  
    # # Note: All drawers are already closed by default

    @classmethod
    def poll(cls, context):
        return context.object is not None 

    def draw(self, context):
        layout = self.layout
        scene = context.scene
        props = scene.meshfixtool_properties
        wiz_bool = props.wiz_boolean
        fill_settings = props.wiz_fill_settings_boolean

        full_func = props.tri_boolean or props.quad_boolean # or props.poly_boolean

        active_obj = context.active_object
        nvs = 0
        ls_bool = False
        size_lmt = None

        if active_obj is not None and active_obj.type == 'MESH':
            nvs = len(active_obj.data.vertices) 

            #=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
            if active_obj and active_obj.type == 'MESH':
                bbox = [active_obj.matrix_world @ Vector(corner) for corner in active_obj.bound_box]
                size_x = (bbox[4] - bbox[0]).length
                size_y = (bbox[2] - bbox[0]).length
                size_z = (bbox[1] - bbox[0]).length            
                smallest_size = min(size_x, size_y, size_z)
                size_lmt = smallest_size / 200 
            #=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#

            if 'Lattice_Structs' in active_obj:
                ls_bool = True

        # layout.label(text="Enable the LoopTools")
        # layout.label(text="Enable the Edit Mesh Tools")


        # v4.0.2
        row = layout.row()
        row.prop(props, "tri_boolean", text="Tri Mesh", icon ='MOD_TRIANGULATE')
        row.prop(props, "quad_boolean", text="Quad Mesh", icon ='SPLIT_VERTICAL')
        # row.prop(props, "poly_boolean", text="Poly Mesh", icon ='MESH_PLANE')

        layout.prop(props, "face_normal_boolean", icon ='ORIENTATION_NORMAL')
                
        row = layout.row()
        row.prop(props, "minor_parts_boolean", icon ='UNLINKED')
        row.prop(props, "minor_parts_threshold",text="Min %", slider=True)

        row = layout.row()
        row.enabled = full_func
        row.prop(props, "spikes_boolean", icon ='SHARPCURVE')
        row.prop(props, "spikes_angle_limit",text="Min Angle", slider=True)

        row = layout.row()
        row.enabled = full_func
        row.prop(props, "intersection_boolean", icon ='MOD_SOLIDIFY')
        row.prop(props, "intersection_angle_limit",text="Min Angle", slider=True)

        row = layout.row()
        row.enabled = full_func
        row.prop(props, "volume_intersection_boolean", icon ='SELECT_EXTEND')
        
        if hasattr(bpy.context.scene, "fix_wizard_properties") and props.wiz_boolean: 
            props_wiz = scene.fix_wizard_properties                   
            row = layout.row()
            row.enabled = full_func
            row.prop(props_wiz, "record_filled_holes", text="", icon = 'EVENT_NDOF_BUTTON_ROLL_CCW')   
            row.operator("object.wiz_clear_all_holes_record", text="", icon = 'FILE_REFRESH')

            row.prop(props, "holes_boolean", text = 'Smart Fill', toggle=True)

            row.prop(props, "wiz_fill_settings_boolean", text = '', icon = 'PREFERENCES')

            if full_func and props.wiz_fill_settings_boolean:             
                #*************************************************************************************#
                hole_size_bool = props_wiz.specific_hole_mesh_size_bool
                hole_ratio_bool = props_wiz.specific_hole_mesh_ratio_bool
                
                box = layout.box()
                row = box.row()
                col = row.column()
                col.scale_x = 2.3         
                col.prop(props_wiz, "specific_hole_mesh_size_bool", toggle=True)

                col = row.column()
                col.enabled = hole_size_bool
                col.scale_x = 3 
                col.prop(props_wiz, "hole_mesh_size", text="")      

                row = box.row()
                col = row.column()
                col.scale_x = 2.3        
                col.prop(props_wiz, "specific_hole_mesh_ratio_bool", toggle=True)

                col = row.column()
                col.enabled = hole_ratio_bool
                col.scale_x = 3 
                col.prop(props_wiz, "hole_mesh_ratio", text="") 

                if size_lmt and hole_size_bool and props_wiz.hole_mesh_size < size_lmt:
                    layout.alert = True
                    layout.label(text="Caution: The hole mesh size may be too small.", icon="ERROR")
                    layout.alert = False 
                
                if hole_ratio_bool and props_wiz.hole_mesh_ratio < 0.2:
                    layout.alert = True
                    layout.label(text="Caution: The hole mesh ratio may be too small.", icon="ERROR")
                    layout.alert = False 

                row = box.row()
                row.prop(props_wiz, "hole_number_limit", text = "Number Limit", slider = True)
                row.prop(props_wiz, "hole_max_size_limit", text = "Size Limit")
                #*************************************************************************************#
        else:
            row = layout.row()
            row.enabled = full_func
            row.prop(props, "holes_boolean", text = 'Fill Holes', icon ='HOLDOUT_ON')


        if not full_func:
            layout.label(text="Enable Tri/Quad Mesh to access full functions", icon="MODIFIER")            
        else:
            if ls_bool:
                layout.alert = True
                layout.label(text="Repairing the lattice structure is not recommended.", icon="ERROR")
                layout.alert = False             
            elif nvs > 300000:
                layout.alert = True
                layout.label(text="Caution: Large mesh detected.", icon="ERROR")
                layout.alert = False 
            else:
                layout.separator()

        # if props.minor_parts_boolean or props.spikes_boolean or props.intersection_boolean or props.holes_boolean or props.face_normal_boolean or props.volume_intersection_boolean:
        #     if not props.meshfixing:
        #         row = layout.row()
        #         row.operator("object.fix_mesh_global", text="AutoFix", icon ='HAND')
        #         row.prop(props, "statistics_boolean",text="", icon ='TEXT')
        #     else:
        #         layout.operator("object.fix_mesh_global", text="Calculating ...", icon ='SEQ_CHROMA_SCOPE')

        
        # v4.0.1
        if not props.meshfixing:
            row = layout.row()
            col = row.column()
            
            # v4.0.2
            col.enabled = full_func or (props.face_normal_boolean or props.minor_parts_boolean)

            # col.enabled = (
            #     full_func or
            #     props.minor_parts_boolean or 
            #     props.spikes_boolean or 
            #     props.intersection_boolean or 
            #     props.holes_boolean or 
            #     props.face_normal_boolean or 
            #     props.volume_intersection_boolean
            # )
            col.scale_y = 1.2
            col.operator("object.fix_mesh_global", text="AutoFix", icon ='HAND')

            col = row.column()
            col.scale_y = 1.2
            col.prop(props, "statistics_boolean",text="", icon ='TEXT')
        else:
            row = layout.row()
            col = row.column()            
            col.scale_y = 1.2
            col.alert = True
            col.operator("object.fix_mesh_global", text="Calculating ...", icon ='SORTTIME')
            col.alert = False

            col = row.column()
            col.scale_y = 1.2
            col.prop(props, "statistics_boolean",text="", icon ='TEXT')



        layout.separator()

        if props.statistics_boolean:
            box = layout.box()
            row = box.row()
            row.label(text="Mesh fixed:")

            # v4.0.1
            if hasattr(bpy.context.scene, "fix_wizard_properties"):
                row.prop(props, "wiz_boolean", text="", icon = 'SOLO_ON' if wiz_bool else 'SOLO_OFF')

            # row.operator("wm.mrts_open_website", icon = 'INTERNET')
            
            row.operator("object.mrts_sinewave", icon = 'FORCE_HARMONIC')
            box.label(text=f"Verts: {props.sum_vertices}")
            box.label(text=f"Edges: {props.sum_edges}")
            box.label(text=f"Faces: {props.sum_faces}")
            if full_func and props.volume_intersection_boolean:
                box.label(text=f"Intersect Volumes: {props.sum_volumes}")
            
            # v4.0.2
            if full_func and props.holes_boolean:            
                if hasattr(bpy.context.scene, "fix_wizard_properties") and props.wiz_boolean: 
                    props_wiz = scene.fix_wizard_properties
                    total_hole_number = props_wiz.total_hole_number
                    # failed_number = props_wiz.failed_number
                    fixed_number = props_wiz.fixed_number

                    row = box.row()
                    if total_hole_number > 0 and fixed_number > 0:         
                            row.label(text=f"Holes: {fixed_number} 🌟")
                    else:
                        row.label(text="Holes: 0  🧙")

                    if props_wiz.record_filled_holes: 
                        row.operator("object.select_next_filled_hole", text="Next Hole", icon = 'LAYER_ACTIVE') 
                        row.operator("object.select_all_filled_hole", text="All Holes", icon = 'OUTLINER_OB_POINTCLOUD') 


               




                    # if total_hole_number > 0:
                    #     box.label(text=f"Holes:")
                    #     row = box.row()
                    #     row.label(text=f"Total : {total_hole_number}")
                    #     if fixed_number > 0:            
                    #         row.label(text=f"Filled : {fixed_number}")
                    #     if failed_number > 0:
                    #         row.alert = True
                    #         row.label(text=f"Failed: {failed_number}")
                    #         row.alert = False

                    # else:
                    #     box.label(text="Holes: 0")                        
    
                else:
                    box.label(text=f"Holes: {props.sum_holes}")









###############################################################################
