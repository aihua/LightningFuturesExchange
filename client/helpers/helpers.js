var fs = require('fs');
var _ = require('underscore');


module.exports = {
   CSVToArray: function( strData, strDelimiter ){
        strDelimiter = (strDelimiter || ",");

        var objPattern = new RegExp(
            (
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );

        var arrData = [[]];
        var arrMatches = null;

        while (arrMatches = objPattern.exec( strData )){
            var strMatchedDelimiter = arrMatches[ 1 ];
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){
                arrData.push( [] );
            }

            var strMatchedValue;

            if (arrMatches[ 2 ]){
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );
            } else {
                strMatchedValue = arrMatches[ 3 ];

            }

            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        return( arrData );
    },

    buildTranslationFiles: function () {
		csvFile = fs.readFileSync("./public/translations/translations.csv", 'utf8')
		csvArray = this.CSVToArray(csvFile);
		
		languages = []

		for (var i = 2; i < csvArray[0].length; i++) {
			languages.push(csvArray[0][i]);
		}

		fs.writeFileSync("./public/translations/languages.js", 'export default ' + JSON.stringify(languages))

		_.map(languages, function (l, i) {
			var lastObject = {}
			var translationObject = {}

			for (var r = 1; r < csvArray.length; r++) {
				if (csvArray[r][0].trim() != '') {
					lastObject = {}
					translationObject[csvArray[r][0]] = lastObject;
				}
				lastObject[csvArray[r][1]] = csvArray[r][2 + i];
			}

			fs.writeFileSync("./public/translations/translation-" + l + ".json", JSON.stringify(translationObject, null, 3))
		})
    },

     default_router_handler: function(func) {
        return function (req, res) {
            try {
                func(req, res);
            } catch (e) {
                console.log(e);
                res.status(500).send(e)
            }       
        }
    }
}