import os
import bpy
import bmesh
# import random
from mathutils import Vector, kdtree, Matrix
from mathutils.bvhtree import BVHTree
import mathutils
import math
import time
from collections import defaultdict

#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+
def visible_active_objmode_select(any_obj):
    # Visible -> Activate -> OBJECT Mode -> Deselect All -> Select 
    any_obj.hide_set(False)
    bpy.context.view_layer.objects.active = any_obj
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    any_obj.select_set(True)
#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+
def enable_addons():
    # Define the list of addons
    addons_list = [
        "mesh_looptools",        # LoopTools
        # "edit_mesh_tools",       # Enable Edit Mesh Tools

    ]
    for addon_name in addons_list:
        if addon_name not in bpy.context.preferences.addons:
            bpy.ops.preferences.addon_enable(module=addon_name)
#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+
def calc_average_edge_len(obj):
    # start_time = time.time()
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    edge_lengths = [edge.calc_length() for edge in bm.edges]
    bm.free()
    # elapsed_time = time.time() - start_time
    # print("Elapsed time: {:.2f} seconds - calc_average_edge_len".format(elapsed_time))
    # print(sum(edge_lengths) / len(edge_lengths))
    return sum(edge_lengths) / len(edge_lengths)
#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+
def bm_remove_spikes(bm, spikes_angle_limit_rad): #spikes_angle_limit_rad: face angle around a vertex
    verts_to_dissolve = set()
    for vertex in bm.verts:
        # Check if vertex is connected to 3 or more faces
        if len(vertex.link_faces) >= 3:
            for face1 in vertex.link_faces:
                for face2 in vertex.link_faces:
                    if face1 != face2 and face1.normal.length != 0 and face2.normal.length != 0:
                        angle = face1.normal.angle(face2.normal)
                        if angle > spikes_angle_limit_rad:
                            verts_to_dissolve.add(vertex)
                            break
                else:
                    continue
                break
    num_dissolved_verts = len(verts_to_dissolve)       
    bmesh.ops.dissolve_verts(bm, verts=list(verts_to_dissolve))        
    return bm, num_dissolved_verts
#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+
# Remove Intersection / Simple Smooth Function
def bm_smooth_mesh(bm, angle_limit_rad, localsmooth = False): #angle_limit_rad: face angle around an edge
    verts_to_dissolve = set()
    def add_vertex_local(vertex):
        if not vertex.select:
            verts_to_dissolve.add(vertex)
    def add_vertex(vertex):
        verts_to_dissolve.add(vertex)
    # Choose which function to use based on the localsmooth flag
    add_vertex_func = add_vertex_local if localsmooth else add_vertex
    for face in bm.faces:
        if face.normal.length <= 0:
            for vert in face.verts:
                add_vertex_func(vert)
    for edge in bm.edges:
        if len(edge.link_faces) > 2:
            for vert in edge.verts:
                add_vertex_func(vert)
            continue
        if len(edge.link_faces) == 2:
            if edge.link_faces[0].normal.length > 0 and edge.link_faces[1].normal.length > 0:
                angle = edge.link_faces[0].normal.angle(edge.link_faces[1].normal)
                if angle > angle_limit_rad:
                    for vert in edge.verts:
                        add_vertex_func(vert)

    num_dissolved_verts2 = len(verts_to_dissolve)  
    bmesh.ops.dissolve_verts(bm, verts=list(verts_to_dissolve))
    return bm, num_dissolved_verts2      
#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+
def remove_loose_parts(bm, threshold = 0.01):
    num_removed_surfaces = 0
    # start_time = time.time()
    # Step 1 - Face
    face_visit_status = {f: False for f in bm.faces}
    linked_faces = defaultdict(list)
    for face in bm.faces:
        for edge in face.edges:
            for linked_face in edge.link_faces:
                if linked_face != face:
                    linked_faces[face].append(linked_face)
    def traverse(face):
        faces_in_component = []
        stack = [face]
        while stack:
            face = stack.pop()
            if not face_visit_status[face]:
                face_visit_status[face] = True
                faces_in_component.append(face)
                stack.extend(linked_faces[face])
        return faces_in_component
    # list of all continuous surfaces
    face_components = []
    for face in bm.faces:
        if not face_visit_status[face]:
            face_components.append(traverse(face))
    f_total = len(bm.faces)
#----------------------------------------------------#
#     # collect vertices from loose components
#    verts_to_remove = set()
#    for component in face_components:
#     if len(component) < f_total * threshold:
#         for face in component:
#             verts_to_remove.update(face.verts)
#    # delete vertices
#    bmesh.ops.delete(bm, geom=list(verts_to_remove), context='VERTS')
#-----------------------------------------------------#
    # delete loose surfaces
    for component in face_components:
        if len(component) < f_total * threshold:
            num_removed_surfaces = num_removed_surfaces + 1
            for face in component:
                bm.faces.remove(face)
#-----------------------------------------------------#
    # Step 2 - Edge
    edges_to_delete = []
    for edge in bm.edges:
        # Delete the edge if it is not connected to any face
        if len(edge.link_faces) < 1:
            edges_to_delete.append(edge)
    # Delete the edges
    num_delete_edges = len(edges_to_delete)
    bmesh.ops.delete(bm, geom=list(edges_to_delete), context='EDGES')
    # Step 3 - Vertex
    verts_to_delete = []
    for vert in bm.verts:
        if len(vert.link_edges) <2:
            verts_to_delete.append(vert)
    # Delete the vertex
    num_deleted_verts = len(verts_to_delete)
    bmesh.ops.delete(bm, geom=list(verts_to_delete), context='VERTS')
    #elapsed_time = time.time() - start_time
    #print("Elapsed time: {:.2f} seconds - Manifold Fix".format(elapsed_time))
    return bm, num_removed_surfaces, num_delete_edges, num_deleted_verts
#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+

def count_holes(boundary_edges):
    visited_edges = set()
    holes_count = 0
    for edge in boundary_edges:
        if edge not in visited_edges:
            # Start a new loop
            holes_count += 1
            current_edge = edge
            while True:
                visited_edges.add(current_edge)
                # Find the next edge in the loop
                next_edge = find_next_edge_in_loop(current_edge, boundary_edges, visited_edges)
                if not next_edge or next_edge == edge:
                    # If no next edge is found or loop is completed, break
                    break
                current_edge = next_edge
    return holes_count

def find_next_edge_in_loop(edge, boundary_edges, visited_edges):
    for next_edge in boundary_edges:
        if next_edge in visited_edges:
            continue
        if edge.verts[0] in next_edge.verts or edge.verts[1] in next_edge.verts:
            return next_edge
    return None

def fill_holes(bm):
    boundary_edges = [edge for edge in bm.edges if len(edge.link_faces) == 1]
    vertex_usage = {}
    for edge in boundary_edges:
        for vert in edge.verts:
            vertex_usage[vert] = vertex_usage.get(vert, 0) + 1
    shared_vertices = [vert for vert, count in vertex_usage.items() if count > 2]
    num_shared_vertices = len(shared_vertices)
    bmesh.ops.delete(bm, geom=shared_vertices, context='VERTS')
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    boundary_edges = [edge for edge in bm.edges if len(edge.link_faces) == 1]
    num_boundary_edges = len(boundary_edges)
    num_holes = count_holes(boundary_edges)
    if boundary_edges:
        bmesh.ops.edgeloop_fill(bm, edges=boundary_edges)
    return bm, num_shared_vertices, num_boundary_edges, num_holes

# v4.0.2 Dissolve edges between flat faces
def bm_flat_mesh(bm):
    edges_to_dissolve = set()
    for edge in bm.edges:
        if len(edge.link_faces) == 2:
            if edge.link_faces[0].normal.length > 0 and edge.link_faces[1].normal.length > 0:
                angle = edge.link_faces[0].normal.angle(edge.link_faces[1].normal)
                if angle < 0.000001:
                    edges_to_dissolve.add(edge)
    bmesh.ops.dissolve_edges(bm, edges=list(edges_to_dissolve))
    return bm

############################################################################################################
############################################################################################################

class LocalFaceNormal(bpy.types.Operator):
    """Unify selection face normal / Flip selection face normal"""
    bl_idname = "object.local_face_normal"
    bl_label = "Flip and Unify Selected Face Normal"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def execute(self, context):

        if context.object.mode != "EDIT":
            self.report({'ERROR'}, "Not in EDIT Mode")
            return {'CANCELLED'}

        mesh = bmesh.from_edit_mesh(bpy.context.active_object.data)
        selected_faces = [f for f in mesh.faces if f.select]
        # Store the initial normals
        initial_normals = [f.normal.copy() for f in selected_faces]
        # Recalculate normals outside
        bpy.ops.mesh.normals_make_consistent(inside=False)
        mesh.faces.ensure_lookup_table()
        # Check if any normals changed
        normals_changed = any((initial_normals[i] != f.normal) for i, f in enumerate(selected_faces))
        # If no normals changed, flip them
        if not normals_changed:
            bpy.ops.mesh.flip_normals()
        # Update the mesh
        bmesh.update_edit_mesh(bpy.context.active_object.data)

        return {'FINISHED'}

############################################################################################################
############################################################################################################

class RemeshLocalV2(bpy.types.Operator):
    """Remesh selection"""
    bl_idname = "object.remesh_local_v2"
    bl_label = "Remesh Selection"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def execute(self, context):

        if context.object.mode != "EDIT":
            self.report({'ERROR'}, "Not in EDIT Mode")
            return {'CANCELLED'}

        # v4.0.1
        props = bpy.context.scene.meshfixtool_properties
        if hasattr(bpy.context.scene, "fix_wizard_properties") and props.wiz_boolean:
        # if props.wiz_boolean:
            if hasattr(bpy.context.scene, "fix_wizard_properties"):
                witz_props = bpy.context.scene.fix_wizard_properties
                if witz_props is None:
                    self.report({'ERROR'}, "Fix Wizard not installed")
                    return {'CANCELLED'}                
                else:
                    try:
                        bpy.ops.object.wiz_remesh(mrt_ra=False, mrt_sr=False, mrt_rs=True, mrt_rr=1)
                    except Exception as e:
                        self.report({'ERROR'}, str(e))
                        return {'CANCELLED'}  

                        # print(f"An error occurred: {e}")                    
                    # bpy.ops.object.wiz_remesh()
            else:
                self.report({'ERROR'}, "WITZ Missing")
                return {'CANCELLED'}


        else:
            bpy.ops.mesh.subdivide(number_cuts=1, smoothness=0, ngon=False, quadcorner='STRAIGHT_CUT', fractal=1, seed=1)
            bpy.ops.mesh.vertices_smooth_laplacian(repeat=10, lambda_factor=1, lambda_border=1e-07, use_x=True, use_y=True, use_z=True, preserve_volume=False)
            bpy.ops.mesh.decimate(ratio=0.3)

        return {'FINISHED'}

############################################################################################################
############################################################################################################


class FixMeshGlobal(bpy.types.Operator):
    """AutoFix mesh in selected object"""
    bl_idname = "object.fix_mesh_global"
    bl_label = "Fix Mesh Global"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None # and context.object.mode == 'OBJECT'

    def create_bvh_tree_from_faces(self, bm, faces):
        bm.verts.ensure_lookup_table()
        bm.faces.ensure_lookup_table()
        bm.edges.ensure_lookup_table()

        bvh_tree = BVHTree.FromPolygons(
            [bm.verts[i].co for i in range(len(bm.verts))], 
            [[v.index for v in f.verts] for f in faces], 
            epsilon=0.0001
        )
        return bvh_tree

    def separate_island_into_object(self, bm, island, original_obj):
        # Create a new mesh
        new_mesh = bpy.data.meshes.new(name=f"{original_obj.name}_island")
        new_bm = bmesh.new()

        # Copy the island faces to the new bmesh
        new_verts = [new_bm.verts.new(v.co) for v in bm.verts]
        new_bm.verts.ensure_lookup_table()
        for face in island:
            new_bm.faces.new([new_verts[v.index] for v in face.verts])

        new_bm.to_mesh(new_mesh)
        new_bm.free()

        # Create a new object
        new_obj = bpy.data.objects.new(f"{original_obj.name}_island", new_mesh)
        bpy.context.collection.objects.link(new_obj)
        new_obj.matrix_world = original_obj.matrix_world
        return new_obj

    def separate_non_intersecting_mesh(self, bm, intersecting_islands, original_obj):
        # Create a new mesh for non-intersecting parts
        new_mesh = bpy.data.meshes.new(name=f"{original_obj.name}_preserve")
        new_bm = bmesh.new()

        intersecting_faces = set(face for island in intersecting_islands for face in island)
        new_verts = [new_bm.verts.new(v.co) for v in bm.verts]
        new_bm.verts.ensure_lookup_table()

        for face in bm.faces:
            if face not in intersecting_faces:
                new_bm.faces.new([new_verts[v.index] for v in face.verts])

        new_bm.to_mesh(new_mesh)
        new_bm.free()

        # Create a new object for the non-intersecting mesh
        new_obj = bpy.data.objects.new(f"{original_obj.name}_preserve", new_mesh)
        bpy.context.collection.objects.link(new_obj)
        new_obj.matrix_world = original_obj.matrix_world
        return new_obj

    def boolean_union(self, any_obj, obj_list):
        visible_active_objmode_select(any_obj)
        any_obj.modifiers.clear()    
        for target in obj_list:
            bool_modifier = any_obj.modifiers.new(name="Boolean", type="BOOLEAN")
            bool_modifier.object = target
            bool_modifier.operation = 'UNION'
            bool_modifier.solver = 'FAST'
            bpy.ops.object.modifier_apply(modifier=bool_modifier.name)

    def recombine_preserved_islands(self, original_obj, preserved_obj):
        visible_active_objmode_select(original_obj)
        preserved_obj.select_set(True)
        bpy.ops.object.join()

    def clear_mesh_without_bmesh(self, obj):
        visible_active_objmode_select(obj)
        obj.data.clear_geometry()
        obj.data.update()

    def get_mesh_islands(self, obj, bm):
        bm.edges.ensure_lookup_table()
        bm.faces.ensure_lookup_table()

        # Find non-manifold edges
        non_manifold_edges = [e for e in bm.edges if not e.is_manifold]

        visited_faces = set()
        islands = []

        for face in bm.faces:
            if face not in visited_faces:
                island = []
                to_visit = [face]
                is_manifold = True

                while to_visit:
                    current_face = to_visit.pop()
                    if current_face not in visited_faces:
                        visited_faces.add(current_face)
                        island.append(current_face)
                        for edge in current_face.edges:
                            if edge in non_manifold_edges:
                                is_manifold = False
                            for linked_face in edge.link_faces:
                                if linked_face not in visited_faces:
                                    to_visit.append(linked_face)

                if is_manifold:
                    islands.append(island)

        return islands

    def check_intersection(self, island1, island2, bm):
        bvh_tree1 = self.create_bvh_tree_from_faces(bm, island1)
        bvh_tree2 = self.create_bvh_tree_from_faces(bm, island2)

        if bvh_tree1.overlap(bvh_tree2):
            return True
        else:
            return False


    def volume_intersection(self, obj):
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bm.faces.ensure_lookup_table()

        islands = self.get_mesh_islands(obj, bm)
        itc = 0        
        if len(islands) > 1:

            intersecting_islands_set = set()
            # Check for intersection between islands
            for i in range(len(islands)):
                for j in range(i + 1, len(islands)):
                    if self.check_intersection(islands[i], islands[j], bm):
                        itc += 1
                        intersecting_islands_set.add(tuple(islands[i]))
                        intersecting_islands_set.add(tuple(islands[j]))

            # print(f"Intersection number = {itc}")

            if itc > 0:
                intersecting_islands = [list(island) for island in intersecting_islands_set]
                # Separate intersecting islands into objects
                intersecting_objects = [self.separate_island_into_object(bm, island, obj) for island in intersecting_islands]

                # Separate non-intersecting mesh
                preserved_obj = self.separate_non_intersecting_mesh(bm, intersecting_islands_set, obj)

                self.clear_mesh_without_bmesh(obj)
                self.boolean_union(obj, intersecting_objects)
                if preserved_obj:
                    self.recombine_preserved_islands(obj, preserved_obj)                        
                for temp_obj in intersecting_objects:
                    bpy.data.objects.remove(temp_obj, do_unlink=True)
        bm.free()
        return itc
    
    def execute(self, context):
        props = bpy.context.scene.meshfixtool_properties
        # enable_addons() # Enable Extra Addons 
        # pre_select = False
        tri_bool = props.tri_boolean
        quad_bool = props.quad_boolean
        # poly_bool = props.poly_boolean
        full_func = tri_bool or quad_bool # or poly_bool

        if context.object is None or context.object.type != 'MESH' or context.object.hide_get():
            self.report({'ERROR'}, "Invalid Selection")
            return {'CANCELLED'}

        props.meshfixing = True
        bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)

        threshold = props.minor_parts_threshold / 100 #%
        # Convert the intersection_angle_limit to radians
        angle_limit_rad = math.radians(180 - props.intersection_angle_limit)
        # Convert the spikes_angle_limit to radians
        spikes_angle_limit_rad = math.radians(180 - props.spikes_angle_limit)
        # Store the current mode
        current_mode = bpy.context.object.mode     
        # Activate -> OBJECT Mode -> Deselect All -> Select
        obj = context.active_object         
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)

        # Merge vertices by distance (remove doubles)
        bpy.ops.object.mode_set(mode='EDIT')

        # if any(vert.select for vert in obj.data.vertices):
        #     pre_select = True
        #     bpy.ops.object.vertex_group_add()
        #     obj.vertex_groups.active.name = "global_selected_verts"
        #     bpy.ops.object.vertex_group_assign()            

        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles()

        # Triangulate and Correct Face Normal
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        # v4.0.2
        if full_func:
            bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
        # bpy.ops.mesh.normals_make_consistent(inside=False)

        #===========================================================================#
        # v3.0.5
        if props.face_normal_boolean:
            bpy.ops.mesh.normals_make_consistent(inside=False)      
        #===========================================================================#

        # Back to object mode
        bpy.ops.object.mode_set(mode='OBJECT')

        # Create a BMesh object and fill it with the active object's mesh data
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bm.normal_update() # Ensure the face normals are up to date
        
        # Call bm_remove_spikes
        num_dissolved_verts = 0
        if full_func and props.spikes_boolean:
            bm, num_dissolved_verts = bm_remove_spikes(bm, spikes_angle_limit_rad)

        # Call bm_smooth_mesh
        num_dissolved_verts2 = 0
        if full_func and props.intersection_boolean:
            bm, num_dissolved_verts2 = bm_smooth_mesh(bm, angle_limit_rad)
        
        # Call remove_loose_parts
        num_removed_surfaces = 0
        num_delete_edges = 0
        num_deleted_verts = 0
        if props.minor_parts_boolean:
            bm, num_removed_surfaces, num_delete_edges, num_deleted_verts = remove_loose_parts(bm, threshold)

        # v4.0.1
        #===========================================================================#
        bm.to_mesh(obj.data)
        obj.data.update()
        bm.free()
        
        # v3.0.3      
        if full_func and props.volume_intersection_boolean:
            num_volumes = 0
            num_volumes = self.volume_intersection(obj)
            props.sum_volumes = num_volumes

        # Refresh Data
        num_shared_vertices = 0
        num_boundary_edges = 0
        num_holes = 0

        props.sum_vertices  = 0
        props.sum_edges     = 0
        props.sum_faces     = 0
        props.sum_holes     = 0

        # Call fill holes        
        if full_func and props.holes_boolean:

            if hasattr(bpy.context.scene, "fix_wizard_properties") and props.wiz_boolean:
                try:
                    bpy.ops.object.wiz_fill_n_wrap(wrap_all_v6=False, mrt_fa=True) 

                except Exception as e:
                    if str(e).strip() == "Error: No holes were detected.":
                        bpy.context.scene.fix_wizard_properties.total_hole_number = 0
                    else:
                        self.report({'ERROR'}, str(e))
                        # return {'CANCELLED'}

            else:
                bm = bmesh.new()
                bm.from_mesh(obj.data)
                bm.normal_update()              
                
                bm, num_shared_vertices, num_boundary_edges, num_holes = fill_holes(bm)
                
                bm.to_mesh(obj.data)
                obj.data.update()
                bm.free()


        #===========================================================================#





        #//////////////////////////////////////////////////////////////////////////////////////////////////////////#
        # # Call fill holes
        # num_shared_vertices = 0
        # num_boundary_edges = 0
        # num_holes = 0
        # if props.holes_boolean:
        #     bm, num_shared_vertices, num_boundary_edges, num_holes = fill_holes(bm)
        # props.sum_vertices  = 0
        # props.sum_edges     = 0
        # props.sum_faces     = 0
        # props.sum_holes     = 0
        # props.sum_vertices = num_dissolved_verts + num_dissolved_verts2 + num_deleted_verts + num_shared_vertices
        # props.sum_edges = num_delete_edges
        # props.sum_faces = num_removed_surfaces
        # props.sum_holes = num_holes
        # bm.to_mesh(obj.data)
        # obj.data.update()
        # bm.free()
        # #===========================================================================#
        # # v3.0.3      
        # if props.volume_intersection_boolean:
        #     num_volumes = 0
        #     num_volumes = self.volume_intersection(obj)
        #     props.sum_volumes = num_volumes
        # #===========================================================================#
        #//////////////////////////////////////////////////////////////////////////////////////////////////////////#


        # Remove Double and Triangulate
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles()
        # v4.0.2
        if full_func:
            bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
            if not tri_bool:
                bpy.ops.mesh.tris_convert_to_quads(face_threshold=0.698132, shape_threshold=0.698132, uvs=False, vcols=False, seam=False, sharp=False, materials=False)      

        bpy.ops.mesh.select_all(action='DESELECT')

        # if poly_bool:
        #     bpy.ops.object.mode_set(mode='OBJECT')
        #     bm = bmesh.new()
        #     bm.from_mesh(obj.data)
        #     bm.normal_update()              
            
        #     bm = bm_flat_mesh(bm)
            
        #     bm.to_mesh(obj.data)
        #     obj.data.update()
        #     bm.free()

        props.sum_vertices = num_dissolved_verts + num_dissolved_verts2 + num_deleted_verts + num_shared_vertices
        props.sum_edges = num_delete_edges
        props.sum_faces = num_removed_surfaces
        props.sum_holes = num_holes

        # Restore the mode
        bpy.ops.object.mode_set(mode=current_mode)  
        props.meshfixing = False

        return {'FINISHED'}



############################################################################################################
############################################################################################################

class SmoothLocalV2(bpy.types.Operator):
    """Smooth selection"""
    bl_idname = "object.smooth_local_v2"
    bl_label = "Smooth Selection 2"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def execute(self, context):

        if context.object.mode != "EDIT":
            self.report({'ERROR'}, "Not in EDIT Mode")
            return {'CANCELLED'}
                 
        bpy.ops.mesh.vertices_smooth(factor=0.5, repeat=5)

        return {'FINISHED'}

############################################################################################################
############################################################################################################
class FlattenLocal(bpy.types.Operator):
    bl_idname = "object.flatten_local"
    bl_label = "Flatten Selection"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def execute(self, context):
        enable_addons()
        props = bpy.context.scene.meshfixtool_properties
        bumper_reduction = int(props.bumper_reduction)
        obj = context.active_object 
        if context.object.mode != "EDIT":
            self.report({'ERROR'}, "Not in EDIT Mode")
            return {'CANCELLED'}                 
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)

        bpy.ops.object.mode_set(mode='EDIT')
        if not any(face.select for face in obj.data.polygons):  
            self.report({'ERROR'}, "Selection not Detected")
            return {'CANCELLED'}

        bm = bmesh.from_edit_mesh(obj.data)
        selected_faces = [f for f in bm.faces if f.select]
        linked_faces = {f: set() for f in selected_faces}
        for face in selected_faces:
            for edge in face.edges:
                for linked_face in edge.link_faces:
                    if linked_face.select:
                        linked_faces[face].add(linked_face)
        checked_faces = set()
        stack = [selected_faces[0]]
        while stack:
            face = stack.pop()
            checked_faces.add(face)
            for linked_face in linked_faces[face]:
                if linked_face not in checked_faces:
                    stack.append(linked_face)
        
        # bm.free()
        if len(checked_faces) != len(selected_faces):
            self.report({'ERROR'}, "Invalid mesh selection")
            return {'CANCELLED'}


        bpy.ops.mesh.looptools_flatten(influence=100, lock_x=False, lock_y=False, lock_z=False, plane='view', restriction='none')

        bpy.ops.transform.resize(value=(0.5, 0.5, 0.5), orient_type='GLOBAL', 
            orient_matrix=((1, 0, 0), (0, 1, 0), (0, 0, 1)), orient_matrix_type='GLOBAL')

        bpy.context.scene.transform_orientation_slots[0].type = 'VIEW'
        bpy.ops.transform.translate(value=(0, 0, bumper_reduction))
        bpy.context.scene.transform_orientation_slots[0].type = 'GLOBAL'

        bpy.ops.object.vertex_group_add()
        obj.vertex_groups.active.name = "temp_BC"
        bpy.ops.object.vertex_group_assign()


        bpy.ops.mesh.delete(type='FACE')

        bpy.ops.object.vertex_group_set_active(group='temp_BC')
        bpy.ops.object.vertex_group_select()

        bpy.ops.mesh.edge_face_add()

        bpy.context.object.vertex_groups.remove(bpy.context.object.vertex_groups['temp_BC'])


        bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
        bpy.ops.mesh.subdivide(number_cuts=5, smoothness=0, ngon=False)
        bpy.ops.mesh.select_more(use_face_step=True)

        bpy.ops.mesh.remove_doubles(threshold=0.1)
        bpy.ops.mesh.vertices_smooth(factor=1, repeat=10)
        bpy.ops.mesh.select_more(use_face_step=True)
        bpy.ops.mesh.subdivide(number_cuts=1, smoothness=0, quadcorner='STRAIGHT_CUT', fractal=0)
        bm.free()
        return {'FINISHED'}


############################################################################################################
############################################################################################################
class ReduceLocal(bpy.types.Operator):
    """Decimate selection"""
    bl_idname = "object.reduce_local"
    bl_label = "Reduce Selection"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def execute(self, context):

        if context.object.mode != "EDIT":
            self.report({'ERROR'}, "Not in EDIT Mode")
            return {'CANCELLED'}
                         
        bpy.ops.mesh.decimate(ratio=0.5)

        return {'FINISHED'}


############################################################################################################
############################################################################################################

class RefineLocal(bpy.types.Operator):
    """Refine selection"""
    bl_idname = "object.refind_local"
    bl_label = "Refine Selection"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.object is not None and context.object.mode == 'EDIT'

    def execute(self, context):

        if context.object.mode != "EDIT":
            self.report({'ERROR'}, "Not in EDIT Mode")
            return {'CANCELLED'}

        # v4.0.1
        props = bpy.context.scene.meshfixtool_properties

        if hasattr(bpy.context.scene, "fix_wizard_properties") and props.wiz_boolean:
        # if props.wiz_boolean:
            if hasattr(bpy.context.scene, "fix_wizard_properties"):
                witz_props = bpy.context.scene.fix_wizard_properties
                if witz_props is None:
                    self.report({'ERROR'}, "Fix Wizard not installed")
                    return {'CANCELLED'}                
                else:
                    try:
                        bpy.ops.object.wiz_remesh(mrt_ra=False, mrt_sr=False, mrt_rs=True, mrt_rr=0.5)
                    except Exception as e:
                        self.report({'ERROR'}, str(e))
                        return {'CANCELLED'}                        
                  
                    # bpy.ops.object.wiz_remesh()
            else:
                self.report({'ERROR'}, "WITZ Missing")
                return {'CANCELLED'}


        else:
            current_select_mode = tuple(bpy.context.tool_settings.mesh_select_mode)
            bpy.context.tool_settings.mesh_select_mode = (False, False, True)              
            bpy.ops.mesh.select_less()
            bpy.ops.mesh.subdivide(number_cuts=1, smoothness=0, ngon=False, quadcorner='STRAIGHT_CUT', fractal=1, seed=1)
            bpy.ops.mesh.vertices_smooth_laplacian(repeat=10, lambda_factor=1, lambda_border=1e-07, use_x=True, use_y=True, use_z=True, preserve_volume=False)
            bpy.ops.mesh.select_more()
            bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
            bpy.context.tool_settings.mesh_select_mode = current_select_mode
        return {'FINISHED'}

############################################################################################################
############################################################################################################