
/*
	Steam Workshop Collection URL to KF2 ini file
	Created by BlackBurn ( https://github.com/DouglasAntunes )

	Original YQL Script Created by James Padolsey ( https://j11y.io/javascript/using-yql-with-jsonp/ )
*/
var debugMode = false;

function YQLQuery(query, callback) {
    this.query = query;
    this.callback = callback || function(){};
    this.fetch = function() {
 
        if (!this.query || !this.callback) {
            throw new Error('YQLQuery.fetch(): Parameters may be undefined');
        }
 
        var scriptEl = document.createElement('script'),
            uid = 'yql' + +new Date(),
            encodedQuery = encodeURIComponent(this.query),
            instance = this;
        YQLQuery[uid] = function(json) {
            instance.callback(json);
            delete YQLQuery[uid];
            document.body.removeChild(scriptEl);
        };
        scriptEl.src = 'https://query.yahooapis.com/v1/public/yql?q='
                     + encodedQuery + '&format=json&callback=YQLQuery.' + uid;
     	if(debugMode) {
			console.log("Query URL: " + scriptEl.src);	
			console.log(scriptEl);
		}
        document.body.appendChild(scriptEl);
    };
}



function doProcess() {
	var workshopCollURL = document.getElementById('workshop-collection-url').value,
		defaultWorkshopUrl = "http://steamcommunity.com/sharedfiles/filedetails/?id=",
		container = document.getElementById('result');

	document.getElementById('resultbox').style.visibility = 'visible';
	container.innerHTML = "";
	container.style.color = 'black';

	container.innerHTML = "Processing...";

	if(workshopCollURL.length == 0) {
		container.style.color = 'red';
		container.innerHTML = 'No URL.';
		//Show Error Mensage about the empty input
		return;
	}
	if(!workshopCollURL.startsWith(defaultWorkshopUrl)) {
		//Show Error Mensage about url not in format
		container.style.color = 'red';
		container.innerHTML = 'Invalid URL Format.';
		return;
	}
	
	var isExistsSectionKFWorkshopSteamwoks = document.getElementById('exists-section-KFWorkshopSteamwoks').checked,
		callback = function(data) {
			if(debugMode) {
				console.log("JSON Object");
				console.log(data);
			}

			container.innerHTML = "";

			var dotIniUrlFormat = "ServerSubscribedWorkshopItems=", 
				workshopCollTitle = data.query.results.div[0].content,
				workshopCollItems = data.query.results.div,
				workshopCollNumberItems = (workshopCollItems.length)-1,
				d = new Date();

		    if(!isExistsSectionKFWorkshopSteamwoks) {
		    	container.innerHTML = container.innerHTML + "[OnlineSubsystemSteamworks.KFWorkshopSteamworks]" + '<br><br>';	
		    }

			container.innerHTML = container.innerHTML + "### " + workshopCollTitle + ' ###' + '<br>' + '### Coll URL: ' + workshopCollURL + ' ###' + '<br>' +
									"### "+ workshopCollNumberItems + " Items | Last Query: " + d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' ###' + '<br>';
			
			delete d;

			workshopCollItems.forEach(function(item, index) {
				if(index != 0) {
					var link = item.a.href;
					var name = item.a.content;
					container.innerHTML = container.innerHTML + link.replace(defaultWorkshopUrl, dotIniUrlFormat) + "  #" + name + '<br>'; //paragraph	
				}
			});

			container.innerHTML = container.innerHTML + "## END of " + workshopCollTitle + ' ##' + '<br>';
		        
		};

	var workshopCollItemsQueryInit = "select * from html where url=",
		workshopCollItemsQueryLast = "and xpath=\"//div[@class='workshopItemTitle']\"",
		//
		workshopCollectionItemsQueryData = new YQLQuery(workshopCollItemsQueryInit + "\"" + workshopCollURL + "\" " + workshopCollItemsQueryLast, callback);

	// If you're ready then go:
	workshopCollectionItemsQueryData.fetch(); // Go!!
}
