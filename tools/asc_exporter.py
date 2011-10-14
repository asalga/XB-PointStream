"""
Andor Salga

This script will take all the vertices and normals of a mesh and export them to an
ASC point cloud.
"""

import bpy
import os
from bpy.props import *
from bpy.ops import *

#addon description
bl_info = {
	"name": "Export to ASC",
	"author": "Andor Salga",
	"version": (0,0,1),
	"blender": (2, 5, 9),
	"api": "",
	"category": "Export",
	"location": "File > Export > ASC",
	"description": "Export selected mesh to a point cloud.",
	"warning": '',
	"wiki_url": "",
	"tracker_url": "",
}

class ascExporter(bpy.types.Operator):
  bl_idname = "import_image.brushsett"
  bl_label = "Export .asc"

  filename = StringProperty(name="File Name", description="filepath", default="", maxlen=1024, options={'ANIMATABLE'}, subtype='NONE')
  filepath = StringProperty(name="File Name", description="filepath", default="", maxlen=1024, options={'ANIMATABLE'}, subtype='NONE')

  def execute(self, context):
    doExport(self.properties.filepath);
    return {'FINISHED'}

  def invoke(self, context, event):
    wm = context.window_manager
    wm.fileselect_add(self)
    return {'RUNNING_MODAL'}

#
def asc_export(path, meshObjects):
  fileObject = open(path, 'w')
  totalNumVertices = 0

  for mesh in meshObjects:
    currMesh = mesh.data
    coords = [vertex.co for vertex in currMesh.vertices]
    normals = [vertex.normal for vertex in currMesh.vertices]

    numCoords = len(coords)
    totalNumVertices += numCoords
    for i in range(numCoords):
      str = "%f %f %f %f %f %f\n" % (coords[i].x, coords[i].y, coords[i].z, normals[i].x, normals[i].y, normals[i].z)
      fileObject.write(str)

  fileObject.close()

#
def doExport(path):
  selected_objects = bpy.context.selected_objects

  # Make sure the user has selected at least one object in the scene.
  if len(bpy.context.selected_objects) > 0:  
    mesh_objects = []

    for selected_object in selected_objects:
      if selected_object.type == 'MESH':
        mesh_objects.append(selected_object)

    asc_export(path, mesh_objects)

#
def menu_func(self, context):
	#clear the default name for import
	default_name = "" 

    # Set the title in the menu.
	self.layout.operator(ascExporter.bl_idname, text="Point Cloud (.asc)").filename = default_name

#
def register():    
	bpy.utils.register_module(__name__)
	bpy.types.INFO_MT_file_export.append(menu_func)

#
def unregister():
	bpy.utils.unregister_module(__name__)
	bpy.types.INFO_MT_file_export.remove(menu_func)

#
if __name__ == "__main__":
	register()
