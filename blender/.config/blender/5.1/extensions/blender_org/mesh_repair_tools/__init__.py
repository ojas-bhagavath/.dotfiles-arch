bl_info = {
    "name": "Mesh Repair Tools",
    "author": "SineWave",
    "version": (4, 0 ,2 ),
    "blender": (4, 2, 0),
    "location": "Object > Add > Mesh",
    "description": "Mesh Repair Tools",
    "category": "Mesh",
}

if "bpy" in locals():
    import importlib

    importlib.reload(mrts)
    importlib.reload(sinewave)
    importlib.reload(properties)    
    importlib.reload(panels) 

else:

    from . import mrts  
    from . import sinewave 
    from . import properties  
    from . import panels

import bpy

classes = (


    # MRTS
    mrts.LocalFaceNormal,
    mrts.RemeshLocalV2,
    mrts.FixMeshGlobal,
    mrts.SmoothLocalV2,
    mrts.FlattenLocal,
    mrts.ReduceLocal,
    mrts.RefineLocal,

    # SineWave
    sinewave.MRTS_sinewave,

    # Panels
    panels.VIEW3D_PT_MeshFixLocalPanel,
    panels.VIEW3D_PT_MeshFixGlobalPanel,


)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

    properties.register()    

def unregister():

    properties.unregister()

    for cls in classes:
        bpy.utils.unregister_class(cls)
    

if __name__ == "__main__":
    register()

