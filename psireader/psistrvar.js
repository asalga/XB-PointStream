// Declare tags
var bgnDocument   = "<PsDocument>",
    endDocument   = "</PsDocument>",
    bgnComposite  = "<PsComposite>",
    endComposite  = "</PsComposite>",
    bgnSubject    = "<PsSubject",
    endSubject    = "</PsSubject>",
    bgnInstance   = "<PsInstance>",
    endInstance   = "</PsInstance>",
    bgnEnv        = "<PsEnvironment>",
    endEnv        = "</PsEnvironment>",
    bgnName       = "<Name>",
    endName       = "</Name>",
    intMatIdStr   = "<Identity>",       // Internal Matrix Identity
    extMatIdStr   = "<ExtIdentity>";    // External Matrix Identity

var bgnCompList       = "<PsList>",
    endCompList       = "</PsList>",
    compositeModelStr = "CompositeModel:",
    instanceModelStr  = "InstanceModel:",
    nurbSurfaceStr    = "NurbSurface",
    nurbCurveStr      = "NurbCurve",
    lineModelStr      = "LineModel",
    quadMeshStr       = "QuadMeshModel",
    triMeshStr        = "TriMeshModel",
    cloudModelStr     = "CloudModel",
    imgCloudModelStr  = "ImageCloudModel",
    txtObjStr         = "TextObject",
    imgObjStr         = "ImageObject",
    soundObjStr       = "SoundObject",
    octTreeModelStr   = "OctTreeModel",
    openBracket       = "<",
    closeBracket      = ">",
    slashEndMark      = "/",
    psPrefix          = "Ps";

// Shuffle Config Variable Strings
var bgnShuffle      = "<Shuffle>",
    endShuffle      = "<\\Shuffle>",
    bgnTempLight    = "<PsTempLight>",
    endTempLight    = "<\\PsTempLight>",
    bgnTempLightVec = "<PsTempLightVec>",
    endTempLightVec = "<\\PsTempLightVec>",
    bgnGlblAmbLight = "<PsGlobalAmbientLight>",
    endGlblAmbLight = "<\\PsGlobalAmbientLight>",
    bgnLightType    = "<PsLightType>",
    endLightType    = "<\\PsLightType>";

// Environment Variable Strings - <PsEnvironment>
var posDataStr  = "XYZData=",
    colDataStr  = "RGBData=",
    normDataStr = "IJKData=",
    fileTypeStr = "FileType=",
    compStr     = "Compression=",
    encStr      = "Encryption=",
    wtrMrkStr   = "WaterMark=",
    lenUnitStr  = "LengthUnit=";

// View Variable Strings
var bgnViewDef  = "<PointStream_View_Definition>",
    endViewDef  = "</PointStream_View_Definition>",
    quartStr    = "<Q",       // Quarternion Matrix
    pivotStr    = "<P",       // Pivot
    transStr    = "<T",       // Translation
    angStr      = "<A",       // FOV Angle
    scrnSizeStr = "<S",       // Screen Size
    bgColStr    = "<B",       // Background Color
    cv1Str      = "<Cv1";

// Material Variable Strings
var bgnTemp1Mat = "<PsTemp1Material>",
    endTemp1Mat = "<\\PsTemp1Material>";

// Parent Variable Strings
var bgnParentTag = "<PsParent= '";
    endParentTag = "'>";

// PsSubject Variables Strings
var selStr  = "Sel=",
    visStr  = "Vis=",
    lockStr = "Lok=",
    actStr  = "Act=";

// Token Model Variable Strings
var bgnLineModel    = "<PsLineModel>",
    bgnCloudModel   = "<PsCloudModel>",
    bgnImgCldModel  = "<PsImageCloudModel>",
    bgnTriMeshModel = "<PsTriMeshModel>",
    bgnNurbCurve    = "<PsNurbCurve>",
    bgnNurbSurface  = "<PsNurbSurface>",
    bgnTextObject   = "<PsTextObject>",
    bgnImageObject  = "<PsImageObject>",
    bgnSoundObject  = "<PsSoundObject>",
    bgnOctTreeModel = "<PsOctTreeModel>";

// Level of Detail Variable Strings
var numLvlStr   = "<NumLevels=",
    scnMatStr   = "<ScanMatrix:",
    bgnLvlStr   = "<Level=",
    endLvlStr   = "</Level=",
    binCloudStr = "<BinaryCloud>",
    ascCloudStr = "<AsciiCloud>",
    fmtStr      = "<Format=";

var numPtStr  = "<NumPoints=",
    sptSzStr  = "<SpotSize=",
    posMinStr = "<Min=",
    posMaxStr = "<Max=";
