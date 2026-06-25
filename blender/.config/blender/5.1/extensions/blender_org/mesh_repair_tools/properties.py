import bpy # type: ignore
from bpy.types import PropertyGroup # type: ignore
from bpy.props import BoolProperty, IntProperty, EnumProperty, PointerProperty, CollectionProperty, FloatProperty # type: ignore

#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+

class MFTProperties(bpy.types.PropertyGroup):

    # v4.0.2
    #--------------------------------------------------#
    def update_tri(self, context):
        if self.tri_boolean:
            if self.quad_boolean:
                self.quad_boolean = False
            if self.poly_boolean:
                self.poly_boolean = False
                
    def update_quad(self, context):
        if self.quad_boolean:
            if self.tri_boolean:
                self.tri_boolean = False
            if self.poly_boolean:
                self.poly_boolean = False

    def update_poly(self, context):
        if self.poly_boolean:
            if self.tri_boolean:
                self.tri_boolean = False
            if self.quad_boolean:
                self.quad_boolean = False                
    #--------------------------------------------------#

    #---------------------- RemeshLocal ------------------------------#
    v1_boolean: bpy.props.BoolProperty(
        name="Fixing Tools V1",
        description="Enalbe Fixing Tools V1",
        default=False,       
    ) # type: ignore

    remesh_option: bpy.props.EnumProperty(
        name="",
        items=[
            ("regular", "Regular", "Current Mesh Size"),
            ("fine", "Fine", "Current Mesh Size /2"),
            ("coarse", "Coarse", "Current Mesh Size x2"),
            ("customized", "Customized", ""),
        ],
        default="regular",
        description="Mesh Size",
    ) # type: ignore

    # Define the property for Remesh
    mesh_size: bpy.props.FloatProperty(
        name="",
        default=0.2,
        description="Mesh Size",
        min=0.01, max=10, precision=2,
    ) # type: ignore

    # Define the property for aspect ratio
    aspect_ratio: bpy.props.FloatProperty(
        name="",
        default=0.5,
        description="100% Aspect Ratio -> SSS Triangle",
        min=0.1, max=1, precision=1,
    ) # type: ignore

    # Iteration times
    iter: bpy.props.IntProperty(
        name="",
        default=1,
        description="Iteration Times",
        min=1, max=10,
    ) # type: ignore

    #---------------------- FixMeshGlobal ------------------------------#

    meshfixing: bpy.props.BoolProperty(
        name="Fixing Status",
        description="Mesh Fixing Status",
        default=False,       
    ) # type: ignore

    sum_vertices: bpy.props.IntProperty() # type: ignore
    sum_edges   : bpy.props.IntProperty() # type: ignore
    sum_faces   : bpy.props.IntProperty() # type: ignore
    sum_holes   : bpy.props.IntProperty() # type: ignore
    sum_volumes : bpy.props.IntProperty() # type: ignore

    # v4.0.2
    tri_boolean: bpy.props.BoolProperty(
        name="Tri Mesh",
        description="Triangulate Mesh",
        default=True,
        update=update_tri,       
    ) # type: ignore

    quad_boolean: bpy.props.BoolProperty(
        name="Quad Mesh",
        description="Quadrangulate Mesh",
        default=False, 
        update=update_quad,      
    ) # type: ignore

    poly_boolean: bpy.props.BoolProperty(
        name="Poly Mesh",
        description="Merge Faces on Shared Planes",
        default=False, 
        update=update_poly,      
    ) # type: ignore

    minor_parts_boolean: bpy.props.BoolProperty(
        name="Noise Shells",
        description="Remove Loose Parts",
        default=False,       
    ) # type: ignore

    intersection_boolean: bpy.props.BoolProperty(
        name="Intersect Face",
        description="Fix Intersection",
        default=False,       
    ) # type: ignore

    spikes_boolean: bpy.props.BoolProperty(
        name="Spikes",
        description="Remove Spikes",
        default=False,       
    ) # type: ignore

    holes_boolean: bpy.props.BoolProperty(
        name="Fill Holes",
        description="Fill Holes",
        default=False,       
    ) # type: ignore

    face_normal_boolean: bpy.props.BoolProperty(
        name="Face Normal",
        description="Recalculate Face Normal -> Outside",
        default=False,       
    ) # type: ignore

    volume_intersection_boolean: bpy.props.BoolProperty(
        name="Intersect Volumes",
        description="Unify Intersecting Manifold Structures. \nThis operation removes mesh details such as Vertex Groups",
        default=False,       
    ) # type: ignore

    # Define the minor parts threshold
    minor_parts_threshold: bpy.props.FloatProperty(
        name="",
        default=1,
        description="Loose Parts Face Threshold",
        min=0.1, max=5, precision=1,step=0.1,
    ) # type: ignore

    # Intersection angle limit
    intersection_angle_limit: bpy.props.FloatProperty(
        name="",
        default=10,
        description="Sharp Edges",
        min=1, max=60, precision=1,step=1.0,
    ) # type: ignore

    # Spikes angle limit
    spikes_angle_limit: bpy.props.FloatProperty(
        name="",
        default=10,
        description="Pointy Vertices",
        min=1, max=60, precision=1,step=1.0,
    ) # type: ignore

    statistics_boolean: bpy.props.BoolProperty(
        name="Statistics",
        description="Show Statistics of Mesh Repair",
        default=True,       
    ) # type: ignore
    #---------------------- SmoothLocal ------------------------------#
    localsmooth_angle_limit: bpy.props.EnumProperty(
        name="",
        items=[
            ("90", "1", ""),
            ("120", "2", ""),
            ("150", "3", ""),
            #("customized", "Customized", ""),
        ],
        default="120",
        description="Smooth",
    ) # type: ignore

    #---------------------- Bumper Reduction Depth ------------------------------#
    bumper_reduction: bpy.props.EnumProperty(
        name="",
        items=[
            ("0", "No Offset", ""),
            ("-3", "1 Offset", ""),
            ("-5", "2 Offset", ""),
            ("-7", "3 Offset", ""),
            #("customized", "Customized", ""),
        ],
        default="0",
        description="Offset Level",
    ) # type: ignore

    # v4 WIZ
    wiz_boolean: bpy.props.BoolProperty(
        name="Fix Wizard 🧙",
        description="Pro Functions for Remesh and Fill Holes",
        default=True,       
    ) # type: ignore

    wiz_fill_settings_boolean: bpy.props.BoolProperty(
        name="Smart Fill Settings",
        default=False,       
    ) # type: ignore


def register():
    bpy.utils.register_class(MFTProperties)
    bpy.types.Scene.meshfixtool_properties = bpy.props.PointerProperty(type=MFTProperties)
    
def unregister():
    del bpy.types.Scene.meshfixtool_properties
    bpy.utils.unregister_class(MFTProperties)












