#!BPY

"""
Name: 'ASC Exporter'
Blender: 249
Group: 'Export'
Tooltip: 'Export selected meshes to an ASC file'
"""

__author__ = 'Andor Salga'
import Blender
import BPyMessages
import bpy

def asc_export(path, meshObjects):
	fileObject = open(path, 'w')
	totalNumVertices = 0
	
	for mesh in meshObjects:
		currMesh = mesh.getData(mesh=True)
		coords = [vertex.co for vertex in currMesh.verts]
		normals = [vertex.no for vertex in currMesh.verts]
		
		numCoords = len(coords)
		totalNumVertices += numCoords
		for i in xrange(numCoords):
			str = "%f %f %f %f %f %f\n" % (coords[i].x, coords[i].y, coords[i].z, \
										   normals[i].x, normals[i].y, normals[i].z)
			fileObject.write(str)
	
	fileObject.close()
	print 'Exported %d vertices' % totalNumVertices

def main():
	def doExport(path):
		selected_objects = Blender.Object.GetSelected()

		mesh_objects = []
        
		for selected_object in selected_objects:
			if selected_object.getType() == 'Mesh':
				mesh_objects.append(selected_object)

		asc_export(path, mesh_objects)

	def fileSelector(path):
		if path and Blender.sys.exists(path):
			choice = Blender.Draw.PupMenu("%s already exists. Replace it?%%t|Yes|No" % path)
			if choice != 1:
				return

		doExport(path)
		
	# Make sure the user has an object selected in the scene
	if len(Blender.Object.GetSelected()) > 0:
		Blender.Window.FileSelector(fileSelector, 'Ok', Blender.sys.makename(ext='.ASC'))
	else:
		BPyMessages.Error_NoActive()

if __name__ == "__main__":
	main()
