(function(funcName, baseObj) {
	// The public function name defaults to window.docReady
	// but you can pass in your own object and own function name and those will be used
	// if you want to put them in a different namespace
	funcName = funcName || "docReady";
	baseObj = baseObj || window;
	var readyList = [];
	var readyFired = false;
	var readyEventHandlersInstalled = false;

	// call this when the document is ready
	// this function protects itself against being called more than once
	function ready() {
		if (!readyFired) {
			// this must be set to true before we start calling callbacks
			readyFired = true;
			for (var i = 0; i < readyList.length; i++) {
				// if a callback here happens to add new ready handlers,
				// the docReady() function will see that it already fired
				// and will schedule the callback to run right after
				// this event loop finishes so all handlers will still execute
				// in order and no new ones will be added to the readyList
				// while we are processing the list
				readyList[i].fn.call(window, readyList[i].ctx);
			}
			// allow any closures held by these functions to free
			readyList = [];
		}
	}

	function readyStateChange() {
		if ( document.readyState === "complete" ) {
			ready();
		}
	}

	// This is the one public interface
	// docReady(fn, context);
	// the context argument is optional - if present, it will be passed
	// as an argument to the callback
	baseObj[funcName] = function(callback, context) {
		// if ready has already fired, then just schedule the callback
		// to fire asynchronously, but right away
		if (readyFired) {
			setTimeout(function() {callback(context);}, 1);
			return;
		} else {
			// add the function and context to the list
			readyList.push({fn: callback, ctx: context});
		}
		// if document already ready to go, schedule the ready function to run
		if (document.readyState === "complete") {
			setTimeout(ready, 1);
		} else if (!readyEventHandlersInstalled) {
			// otherwise if we don't have event handlers installed, install them
			if (document.addEventListener) {
				// first choice is DOMContentLoaded event
				document.addEventListener("DOMContentLoaded", ready, false);
				// backup is window load event
				window.addEventListener("load", ready, false);
			} else {
				// must be IE
				document.attachEvent("onreadystatechange", readyStateChange);
				window.attachEvent("onload", ready);
			}
			readyEventHandlersInstalled = true;
		}
	}
})("docReady", window);

var vanilla={};
/*
 * getJson creates request to server and returns result to passed callback 
 * @param env 				Object		environment passed to callback on getting succcessfull results
 * @param requestUrl 		String		url the data to be requested from
 * @param cb 				Function	callback function fired on successfull request
 * @param errcb				Function	callback function fired on error (the error text is passed to this calllback)
 */
vanilla.getJson=function(env,requestUrl,cb,errcb){
	

	var request = new XMLHttpRequest();
	request.open('GET', requestUrl, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var data = JSON.parse(request.responseText);
			cb(env,data);
		} else {
			errcb("We reached our target server, but it returned an error");
		}
	};

	request.onerror = function() {
		errcb("There was a connection error of some sort");
	};

	request.send();
}
/* news list component START */
var TheNew = React.createClass({
	render: function() {
		return (
			<li className="theNewItem">
				<span className="newTitle">
					{this.props.title}
				</span>
				<span className="newDate">
					{this.props.data.date}
				</span>
			</li>
		);
	}
});
var NewsList = React.createClass({
	render: function() {
		var newsNodes = this.props.data.map(function(theNew) {
			return (
				<TheNew title={theNew.title} key={theNew.id} data={theNew} >
					{theNew.title}
				</TheNew>
			);
		});
		return (
			<ul className="newsList">
				{newsNodes}
			</ul>
		);
	}
});
//global object for components communication
var newsBoxGlobalObj = {
	"category": "" //current category to load
};
var NewsBox = React.createClass({
	loadNewsFromServer: function(catId) {
		if(typeof(catId)=="undefined" || catId===""){return false;}
		vanilla.getJson(
			this,
			'http://testtask.sebbia.com/v1/news/categories/'+catId+'/news',
			function(env,responseData){
				env.setState({dataNews: (responseData.list)});
			},
			function(errorMessage){
				console.log("Error getting JSON data from server: ",errorMessage);
			}
		);
	},
	getInitialState: function() {
		return {dataNews: []};
	},
	componentDidMount: function() {
		this.loadNewsFromServer("");
		//setInterval(this.loadCategorysFromServer, this.props.pollInterval); //in case you need to reload it automatically from server
	},
	//this is magic react js creators dont want you to know
	componentWillMount: function() {
		newsBoxGlobalObj.cb = (data) => {
			// `this` refers to our react component
			this.loadNewsFromServer(newsBoxGlobalObj.category);
		};
	},
	render: function() {
		return (
			<div className="newsBox">
				<h1>Новости</h1>
				<NewsList data={this.state.dataNews} />
			</div>
		);
	}
});
ReactDOM.render(
	<NewsBox url=""  />,
	document.getElementById('news_list')
);
/* news list module END */

/* category list module START */

/* category partial component */
var Category = React.createClass({
	handleCategoryChoose: function(e) {
		//set category id in global object for newsBox component
		newsBoxGlobalObj.category=this.props.category.id;
		//fire callback for newsBox component update
		newsBoxGlobalObj.cb(e);
	},
	render: function() {
		return (
			<li className="categoryItem" onClick={this.handleCategoryChoose}>
				<span className="categoryName">
					{this.props.name}
				</span>
			</li>
		);
	}
});
var CategoryList = React.createClass({
	render: function() {
		var categoryNodes = this.props.data.map(function(category) {
			return (
				<Category name={category.name} key={category.id} category={category}>
					{category.name}
				</Category>
			);
		});
		return (
			<ul className="categoriesList">
				{categoryNodes}
			</ul>
		);
	}
});


var CategoryBox = React.createClass({
	loadCategorysFromServer: function() {
		vanilla.getJson(
			this,
			'http://testtask.sebbia.com/v1/news/categories',
			function(env,d){
				env.setState({data: (d.list)});
			},
			function(errorMessage){
				console.log("Error getting JSON data from server: ",errorMessage);
			}
		);
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadCategorysFromServer();
		//setInterval(this.loadCategorysFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div className="categoryBox">
				<h1>Новости по категориям</h1>
				<CategoryList data={this.state.data} />
			</div>
		);
	}
});

ReactDOM.render(
	<CategoryBox url="http://testtask.sebbia.com/v1/news/categories" pollInterval={2000} />,
	document.getElementById('category_list')
);
/*category list component END*/
