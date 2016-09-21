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
 * @returns nothing
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
			//TODO check if error callback defined otherwise console.error
			errcb("We reached our target server, but it returned an error");
		}
	};

	request.onerror = function() {
		errcb("There was a connection error of some sort");
	};

	request.send();
}
/* full new component START */
//global object for components communication
var fullNewGlobalObj = {
	"neueId": "", //current new to load
	"setStateHidden": false
};
var FullNew = React.createClass({displayName: "FullNew",
	loadNewsFromServer: function(catId) {
		if(typeof(catId)=="undefined" || catId===""){return false;}
		vanilla.getJson(
			this,
			'http://testtask.sebbia.com/v1/news/details?id='+catId,
			function(env,responseData){
				env.setState({
					dataNews: (responseData.news),
					hide: false
				});
			},
			function(errorMessage){
				console.log("Error getting JSON data from server: ",errorMessage);
			}
		);
	},
	toggle: function(setState) {
		if(typeof(setState)=="undefined" || setState===""){
			this.setState({
				hide: !this.state.hide
			});
		} else {
			this.setState({
				hide: setState
			});
		}
	},
	getInitialState: function() {
		return {
			dataNews: [],
			hide: false
		};
	},
	componentDidMount: function() {
		this.loadNewsFromServer("");
	},
	//this is magic
	componentWillMount: function() {
		var th=this;
		fullNewGlobalObj.cb = function(data) {
			// `this` refers to our react component
			th.loadNewsFromServer(fullNewGlobalObj.neueId);
		};
		//add showHide function to global object
		fullNewGlobalObj.showHide = function(data) {
			th.toggle(fullNewGlobalObj.setStateHidden);
		};
	},
	//prepare html data
	createMarkup: function() { return {__html: this.state.dataNews.fullDescription}; }, //{this.state.dataNews.fullDescription}
	render: function() {
		//TODO show short variant before load
		return (
			React.createElement("div", {className: this.state.hide ? 'fullNew hidden' : 'fullNew'}, 
				React.createElement("div", {className: "theNewItem"}, 
					React.createElement("div", {className: "newTitle"}, 
						this.state.dataNews.title
					), 
					React.createElement("div", {className: "newDate"}, 
						this.state.dataNews.date
					), 
					React.createElement("div", {className: "newDesc", dangerouslySetInnerHTML: this.createMarkup()}
					
					)
				)
			)
		);
	}
});
ReactDOM.render(
	React.createElement(FullNew, {url: ""}),
	document.getElementById('full_new')
);
/* full new component END */

/* news list component START */

/* new-post partial component */
var TheNew = React.createClass({displayName: "TheNew",
	handleReadWholeNew: function(e) {
		console.log("handleReadWholeNew");
		//TODO set status read
		
		
		//set hidden state for NewsBox component
		newsBoxGlobalObj.setStateHidden=true;
		//fire showHide for NewsBox component
		newsBoxGlobalObj.showHide(e);
		//set hidden state for CategoryBox component
		categoryBoxGlobalObj.setStateHidden=true;
		//fire showHide for CategoryBox component
		categoryBoxGlobalObj.showHide(e);
		//show view with full new
		fullNewGlobalObj.neueId=this.props.data.id;
		fullNewGlobalObj.cb(e);
	},
	render: function() {
		return (
			React.createElement("div", {className: "theNewItem"}, 
				React.createElement("div", {className: "newTitle"}, 
					this.props.title
				), 
				React.createElement("div", {className: "newDate"}, 
					this.props.data.date
				), 
				React.createElement("div", {className: "newDesc"}, 
					this.props.data.shortDescription, " ", React.createElement("span", {className: "linkOpenFullNew", onClick: this.handleReadWholeNew}, "Читать полностью")
				)
			)
		);
	}
});
/* list of news partial component */
var NewsList = React.createClass({displayName: "NewsList",
	render: function() {
		var newsNodes = this.props.data.map(function(theNew) {
			return (
				React.createElement(TheNew, {title: theNew.title, key: theNew.id, data: theNew}, 
					theNew.title
				)
			);
		});
		return (
			React.createElement("div", {className: "newsList"}, 
				newsNodes
			)
		);
	}
});
/* pagination START */
var PaginationItem = React.createClass({displayName: "PaginationItem",
	handlePageChoose: function(e) {
		if(this.props.page === parseInt(this.props.page, 10)) {
			newsBoxGlobalObj.page = (this.props.page - 1);
		}
		if(this.props.page === "<" && newsBoxGlobalObj.page > 0){
			newsBoxGlobalObj.page--;
		}
		if(this.props.page === ">" && newsBoxGlobalObj.page < (newsBoxGlobalObj.totalPages - 1)){
			newsBoxGlobalObj.page++;
		}
		//fire callback for newsBox component update
		newsBoxGlobalObj.cb(e);
	},
	render: function() {
		return (
			React.createElement("span", {className: (this.props.additionalCssClass)? "paginationItem "+this.props.additionalCssClass:"paginationItem", onClick: this.handlePageChoose}, 
				this.props.page
			)
		);
	}
});
var NewsListPagination = React.createClass({displayName: "NewsListPagination",
	render: function() {
		var totalPages = newsBoxGlobalObj.totalPages;
		var items = [];
		for (var i = 1; i <= totalPages; i++) {
			items.push(
				React.createElement(PaginationItem, {page: i})
			);
		}
		return (
			React.createElement("div", {className: "pagination"}, 
				React.createElement(PaginationItem, {additionalCssClass: "prev", page: "<"}), 
					items, 
				React.createElement(PaginationItem, {additionalCssClass: "next", page: ">"})
			)
		);
	}
});
/* pagination END */
//global object for components communication
var newsBoxGlobalObj = {
	"category": "", //current category to load
	"setStateHidden": true,
	"page": "",
	"totalPages": 10
};
/* box of news partial component */
var NewsBox = React.createClass({displayName: "NewsBox",
	//get JSON from server
	loadNewsFromServer: function(catId,page) {
		if(typeof(catId)=="undefined" || catId===""){return false;}
		//specified page
		var pageToUrl = (typeof(page) == "undefined" || page=="")? "": ("?page="+page);
		//request
		vanilla.getJson(
			this,
			'http://testtask.sebbia.com/v1/news/categories/'+catId+'/news'+pageToUrl,
			function(env,responseData){
				env.setState({
					dataNews: (responseData.list),
					//hide: env.state.hide
				});
			},
			function(errorMessage){
				console.log("Error getting JSON data from server: ",errorMessage);
			}
		);
	},
	//show/hide component
	toggle: function(setState) {
		if(typeof(setState)=="undefined" || setState===""){
			this.setState({
				hide: !this.state.hide
			});
		} else {
			this.setState({
				hide: setState
			});
		}
	},
	getInitialState: function() {
		return {
			dataNews: [],
			hide: true
		};
	},
	//once component loaded
	componentDidMount: function() {
		this.loadNewsFromServer("");
		//setInterval(this.loadCategorysFromServer, this.props.pollInterval); //in case you need to reload it automatically from server
	},
	//this is magic react js creators dont want you to know
	componentWillMount: function() {
		var th=this;
		newsBoxGlobalObj.cb = function(data) {
			// `this` refers to our react component
			th.loadNewsFromServer(newsBoxGlobalObj.category,newsBoxGlobalObj.page);
		};
		//add showHide function to global object
		newsBoxGlobalObj.showHide = function(data) {
			th.toggle(newsBoxGlobalObj.setStateHidden);
		};
	},
	render: function() {
		return (
			React.createElement("div", {className: this.state.hide ? 'newsBox hidden' : 'newsBox'}, 
				React.createElement("h1", null, "Новости"), 
				React.createElement(NewsList, {data: this.state.dataNews}), 
				React.createElement(NewsListPagination, null)
			)
		);
	}
});
ReactDOM.render(
	React.createElement(NewsBox, {url: ""}),
	document.getElementById('news_list')
);
/* news list module END */

/* category list module START */

/* category partial component */
//global object for components communication

var Category = React.createClass({displayName: "Category",
	handleCategoryChoose: function(e) {
		//set category id in global object for newsBox component
		newsBoxGlobalObj.category=this.props.category.id;
		//fire callback for newsBox component update
		newsBoxGlobalObj.cb(e);
		
		//set hidden state for NewsBox component
		newsBoxGlobalObj.setStateHidden=false;
		//fire showHide for NewsBox component
		newsBoxGlobalObj.showHide(e);
	},
	render: function() {
		return (
			React.createElement("li", {className: "categoryItem", onClick: this.handleCategoryChoose}, 
				React.createElement("span", {className: "categoryName"}, 
					this.props.name
				)
			)
		);
	}
});
var CategoryList = React.createClass({displayName: "CategoryList",
	render: function() {
		var categoryNodes = this.props.data.map(function(category) {
			return (
				React.createElement(Category, {name: category.name, key: category.id, category: category}, 
					category.name
				)
			);
		});
		return (
			React.createElement("ul", {className: "categoriesList"}, 
				categoryNodes
			)
		);
	}
});

var categoryBoxGlobalObj = {
	"setStateHidden": false
};
var CategoryBox = React.createClass({displayName: "CategoryBox",
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
	toggle: function(setState) {
		if(typeof(setState)=="undefined" || setState===""){
			this.setState({
				hide: !this.state.hide
			});
		} else {
			this.setState({
				hide: setState
			});
		}
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadCategorysFromServer();
		//setInterval(this.loadCategorysFromServer, this.props.pollInterval);
	},
	//this is magic 
	componentWillMount: function() {
		var th=this;
		//add showHide function to global object
		categoryBoxGlobalObj.showHide = function(data) {
			th.toggle(categoryBoxGlobalObj.setStateHidden);
		};
	},
	render: function() {
		return (
			React.createElement("div", {className: this.state.hide ? 'categoryBox hidden' : 'categoryBox'}, 
				React.createElement(CategoryList, {data: this.state.data})
			)
		);
	}
});

ReactDOM.render(
	React.createElement(CategoryBox, {url: "http://testtask.sebbia.com/v1/news/categories", pollInterval: 2000}),
	document.getElementById('category_list')
);
/*category list component END*/
