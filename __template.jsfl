//next access the filename of the file
var swfName = "${swf.file}.swf";
var swfPath = "../../../../build/swf/assets/";
var filename = "${fla.file}.fla";
var filePath = "file:///${resources}/fla/questions/${swf.file}";
var docClass = "${docClass}";

//Use jsfl trace statement to view info returned
fl.trace("filename is " + filename);
fl.trace("file path name is " + filePath);

//set actionscript version
var asVersion = 3;

//next create the URI
//tried to hardcode it but jsfl did not like my format
//var tempURI = "file:///H|/nutrition/source/NEPP/RIA_src/pages/m100001-100200/" + filename;
//used getDocumentPath function to get URI for JSFL
//function appended at end
var URI = filePath + "/" +filename;

//now call publish profile function
setPublishProfileSettings(URI,asVersion);

/*
* setPublishProfileSettings
*
* @param 	String 	full URI pathname to current file
* @param	Number	version number for actionscript(2 or 3)
*
* @return 	void
*/
function setPublishProfileSettings(fileURI, asVersion)
{
    // does flash file exist
    if (fl.fileExists(fileURI))
    {
        var xml1, from, to, delta;
		
        // open the flash file
        var doc = fl.openDocument(fileURI);
		
		doc.docClass = docClass;
		
        //grab the file name from its folder path
        var fileName = fileURI.split("/").pop();
		
        //get the current folder path
        var folderPath = fileURI.split(fileName)[0];
		
        //remove fla extension
        fileName = fileName.split(".")[0];
		
        //set pathname for a temp publish profile
        var pPath = folderPath + "_Profile_.xml";
		
        //export default profile settings to temp file
        fl.getDocumentDOM().exportPublishProfile(pPath);
		
        //reload default settings into local xml var
        xml = FLfile.read(pPath);
		
        //OVERRIDE default settings for new profile
       //in xml variable to be written to pPath file
	   
        //NOTE:The flag settings below are set to false
       //Impact - default name values are not used
       //Changing these flags will cause a
       //permanent side-effect, the publish path is reset
       //within the actual fla file which is my desired
       //behaviour
		
       // override default names to 0 from 1
       from = xml.indexOf("<defaultNames>");
       to = xml.indexOf("</defaultNames>");
       delta = xml.substring(from, to);
       xml = xml.split(delta).join("<defaultNames>0");
		
       // override flash default name to 0 from 1
       from = xml.indexOf("<flashDefaultName>");
       to = xml.indexOf("</flashDefaultName>");
       delta = xml.substring(from, to);
       xml = xml.split(delta).join("<flashDefaultName>0");

       // grab publish path indices for swf
       from = xml.indexOf("<flashFileName>");
       to = xml.indexOf("</flashFileName>");
       delta = xml.substring(from, to);
		
       //hard coded the desired deploy directory path
       var parentPath = "";
		
       //change publish path for the swf from the default
       xml = xml.split(delta).join("<flashFileName>" + swfPath + swfName );
	   
        ////////////////////////////////////////////////////////////////
        //NEW CONTENT STARTS HERE
        // - code startpoint was cut and paste from Steven Sacks blog
        //
        // flas that need to reference classes,
        // need to update Package Paths
        // make sure package paths look in :
        //  ./classes, and classes export in frame 1
        from = xml.indexOf("<ActionScriptVersion>");
        to = xml.indexOf("</ActionScriptVersion>");
        delta = xml.substring(from, to);
        xml = xml.split(delta).join("<ActionScriptVersion>" + asVersion);
		
        //set packages to export in frame 1
        from = xml.indexOf("<PackageExportFrame>");
        to = xml.indexOf("</PackageExportFrame>");
        delta = xml.substring(from, to);
        xml = xml.split(delta).join("<PackageExportFrame>1");
		
		//set html to not publish
        from = xml.indexOf("<html>");
        to = xml.indexOf("</html>");
        delta = xml.substring(from, to);
        xml = xml.split(delta).join("<html>0");
		
        // set package paths based on AS version
        if (asVersion == 2)
        {
            from = xml.indexOf("<PackagePaths>");
            to = xml.indexOf("</PackagePaths>");
        }
        else
        {
            from = xml.indexOf("<AS3PackagePaths>");
            to = xml.indexOf("</AS3PackagePaths>");
        }

        delta = xml.substring(from, to);
        /*var classPath = "./";
        if (fileName.indexOf("/") > -1)
        {
             classPath = "";
             var splitPath = fileName.split("/");
             splitPath.length--;
             var i = splitPath.length;
             while (i--)
             {
                classPath += "../";
             }
        }
		
        classPath += "classes";*/
        //alert(classPath);
		
        //brute force - ignored above class detection
        // and set the values here
        /*var neppPath = "H:\nutrition\source\NEPP\RIA_src\classes\AS2"
		allClasses = ".;$(LocalData)/Classes;" + neppPath;*/
		
        /*if (asVersion == 2)
        {
           //xml = xml.split(delta).join("<PackagePaths>" + classPath);
           xml = xml.split(delta).join("<PackagePaths>" + allClasses);
        }
        else
        {
           xml = xml.split(delta).join("<AS3PackagePaths>../../../../src");
        }*/
		
		xml = xml.split(delta).join("<AS3PackagePaths>../../../../src");
		
       ////////////////////////////////////////////////////////////////////////////
		
        // write the modified profile to temp file
        FLfile.write(pPath, xml);
		
        //import new publish profile to be used by fla
        fl.getDocumentDOM().importPublishProfile(pPath);
		
        //request fla testMovie
        //generates swf in deployment directory
        fl.getDocumentDOM().publish();
		
		fl.saveDocument(fl.getDocumentDOM(), filePath + "/" + filename );
		fl.closeDocument(fl.getDocumentDOM(), false);
		fl.quit( false );
		
        // delete the publish profile xml
        FLfile.remove(pPath);
    }
}