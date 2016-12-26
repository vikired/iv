let fs = require('fs'),
        PDFParser = require("pdf2json");
		converter = require('json-2-csv');
		jQuery = require('jquery'); // In Node.js

    let pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
		var pageresult = pdfData.formImage.Pages[0].Texts
        fs.writeFile("D:/Proto/Invoice/test/result/shalaka.json", JSON.stringify(pageresult));
    });
	
	function arrayFrom(json) {
    var queue = [], next = json;
    while (next !== undefined) {
        if (jQuery.type(next) == "array") {

            // but don't if it's just empty, or an array of scalars
            if (next.length > 0) {

              var type = $.type(next[0]);
              var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

              if (!scalar)
                return next;
            }
        } if (jQuery.type(next) == "object") {
          for (var key in next)
             queue.push(next[key]);
        }
        next = queue.shift();
    }
    // none found, consider the whole object a row
    return [json];
}
	
	var csv=function(){
	try {
		var data = JSON.parse(fs.readFileSync('D:/Proto/Invoice/test/result/aircelpage.json', 'utf8'));
		if(data.length === 0 || data=== undefined || typeof data[0] !== 'object')
			console.error("invalid data");
		else
			console.log("valid data");
	
		converter.json2csv(data,function (err, csv){
			console.log(err);
		});
		
	} catch (err) {
	  // Errors are thrown for bad options, or if the data is empty and no fields are provided. 
	  // Be sure to provide fields if it is possible that your data array will be empty. 
	  console.error(err);
	}
	}
    pdfParser.loadPDF("D:/Proto/Invoice/test/shalaka.pdf",5);
    //setTimeout(csv, 5000);
	//csv();