var fs = require('fs');
var _ = require('underscore');


module.exports = {
   CSVToArray: function( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
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
    }
}