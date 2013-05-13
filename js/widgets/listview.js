//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Applies listview styling of various types (standard, numbered, split button, etc.)
//>>label: Listview
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.listview.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css

define( [ "jquery", "../jquery.mobile.widget", "./page", "./page.sections", "./addFirstLastClasses", "../jquery.mobile.registry" ], function( jQuery ) {
//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

var getAttr = $.mobile.getAttribute;

$.widget( "mobile.listview", $.mobile.widget, $.extend( {

	options: {
		theme: null,
		countTheme: "a",
		dividerTheme: "a",
		icon: "arrow-r",
		splitIcon: "arrow-r",
		splitTheme: "a",
		corners: true,
		shadow: true,
		inset: false
	},

	_create: function() {
		var t = this,
			listviewClasses = "";

		listviewClasses += t.options.inset ? " ui-listview-inset" : "";

		if ( !!t.options.inset ) {
			listviewClasses += t.options.corners ? " ui-corner-all" : "";
			listviewClasses += t.options.shadow ? " ui-shadow" : "";
		}

		// create listview markup
		t.element.addClass( " ui-listview" + listviewClasses );

		t.refresh( true );
	},

	// This is a generic utility method for finding the first
	// node with a given nodeName. It uses basic DOM traversal
	// to be fast and is meant to be a substitute for simple
	// $.fn.closest() and $.fn.children() calls on a single
	// element. Note that callers must pass both the lowerCase
	// and upperCase version of the nodeName they are looking for.
	// The main reason for this is that this function will be
	// called many times and we want to avoid having to lowercase
	// the nodeName from the element every time to ensure we have
	// a match. Note that this function lives here for now, but may
	// be moved into $.mobile if other components need a similar method.
	_findFirstElementByTagName: function( ele, nextProp, lcName, ucName ) {
		var dict = {};
		dict[ lcName ] = dict[ ucName ] = true;
		while ( ele ) {
			if ( dict[ ele.nodeName ] ) {
				return ele;
			}
			ele = ele[ nextProp ];
		}
		return null;
	},
	
	_getChildrenByTagName: function( ele, lcName, ucName ) {
		var results = [],
			dict = {};
		dict[ lcName ] = dict[ ucName ] = true;
		ele = ele.firstChild;
		while ( ele ) {
			if ( dict[ ele.nodeName ] ) {
				results.push( ele );
			}
			ele = ele.nextSibling;
		}
		return $( results );
	},

	_addThumbClasses: function( containers ) {
		var i, img, len = containers.length;
		for ( i = 0; i < len; i++ ) {
			img = $( this._findFirstElementByTagName( containers[ i ].firstChild, "nextSibling", "img", "IMG" ) );
			if ( img.length ) {
				$( this._findFirstElementByTagName( img[ 0 ].parentNode, "parentNode", "li", "LI" ) ).addClass( img.hasClass( "ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
			}
		}
	},

	refresh: function( create ) {
		var o = this.options,
			$list = this.element,
			li = this._getChildrenByTagName( $list[ 0 ], "li", "LI" ),
			pos, numli,
			ol = !!$.nodeName( $list[ 0 ], "ol" ),
			start = $list.attr( "start" ),
			startCount, newStartCount, value,
			itemClassDict = {},
			item, itemClass, itemTheme, itemIcon, icon,
			a, isDivider;

		// Check if a start attribute has been set while taking a value of 0 into account
		if ( ol && ( start || start === 0 ) ) {
			startCount = parseInt( start, 10 ) - 1;
			$list.css( "counter-reset", "listnumbering " + startCount );
		}

		if ( o.theme ) {
			$list.addClass( "ui-body-" + o.theme );
		}

		for ( pos = 0, numli = li.length; pos < numli; pos++ ) {
			item = li.eq( pos );
			itemClass = "";

			// TODO: Better way than !item.is( ".ui-listview > li" ) to prevent re-enhancemeent.
			if ( create || !item.is( ".ui-listview > li" ) ) {
				a = this._getChildrenByTagName( item[ 0 ], "a", "A" );
				isDivider = ( getAttr( item[ 0 ], "role", true ) === "list-divider" );
				value = item.attr( "value" );
				itemTheme = getAttr( item[ 0 ], "theme", true );

				if ( a.length && !isDivider ) {
					itemIcon = getAttr( item[ 0 ], "icon", true );
					icon = ( itemIcon === false ) ? false : ( itemIcon || o.icon );

					var buttonClass = "ui-btn ui-btn-" + itemTheme;
					
					if ( itemTheme ) {
						buttonClass += " ui-btn-" + itemTheme;
					}
					
					if ( a.length > 1 ) {
						itemClass += "ui-li-has-alt";
						
						var last = a.last(),
							splittheme = getAttr( last[ 0 ], "theme", true ) || o.splitTheme || getAttr( item[ 0 ], "theme", true ) || o.theme,
							spliticon = getAttr( last[ 0 ], "icon", true ) || o.splitIcon || getAttr( item[ 0 ], "icon", true ) || o.icon,
							splitbutton = $( "<div class='ui-btn ui-btn-" + splittheme + " ui-icon-" + spliticon + " ui-btn-icon-notext ui-corner-all ui-shadow ui-shadow-icon'></div>" );
						
						last
							.attr( "title", $.trim( last.getEncodedText() ) )
							.addClass( "ui-btn ui-btn-" + itemTheme )
							.empty()
							.append( splitbutton );
					} else if ( icon ) {
						buttonClass += " ui-icon-" + icon;
					}
					
					a.first().addClass( buttonClass );
				} else if ( isDivider ) {
					itemClass += "ui-li-divider ui-bar-" + ( getAttr( item[ 0 ], "theme", true ) || o.dividerTheme );
					
					item.attr( "role", "heading" );
				} else {
					itemClass += "ui-li-static ui-body-" + itemTheme;
				}
				if ( ol && value ) {
					var elem = ( a.length && !isDivider ) ? a : item;
					newStartCount = parseInt( value , 10 ) - 1;
					elem.css( "counter-reset", "listnumbering " + newStartCount );
				}
			}

			// Instead of setting item class directly on the list item
			// at this point in time, push the item into a dictionary
			// that tells us what class to set on it so we can do this after this
			// processing loop is finished.

			if ( !itemClassDict[ itemClass ] ) {
				itemClassDict[ itemClass ] = [];
			}

			itemClassDict[ itemClass ].push( item[ 0 ] );
		}

		// Set the appropriate listview item classes on each list item.
		// The main reason we didn't do this
		// in the for-loop above is because we can eliminate per-item function overhead
		// by calling addClass() and children() once or twice afterwards. This
		// can give us a significant boost on platforms like WP7.5.

		for ( itemClass in itemClassDict ) {
			$( itemClassDict[ itemClass ] ).addClass( itemClass );
		}

		$list.find( ".ui-li-count" ).each(function() {
				$( this ).closest( "li" ).addClass( "ui-li-has-count" );
			}).addClass( "ui-fill-" + ( getAttr( $list[ 0 ], "counttheme", true ) || this.options.countTheme) + " ui-corner-all" );

		// The idea here is to look at the first image in the list item
		// itself, and any .ui-link-inherit element it may contain, so we
		// can place the appropriate classes on the image and list item.
		// Note that we used to use something like:
		//
		//    li.find(">img:eq(0), .ui-link-inherit>img:eq(0)").each( ... );
		//
		// But executing a find() like that on Windows Phone 7.5 took a
		// really long time. Walking things manually with the code below
		// allows the 400 listview item page to load in about 3 seconds as
		// opposed to 30 seconds.

		this._addThumbClasses( li );
		this._addThumbClasses( $list.find( "li > .ui-btn" ) );

		this._addFirstLastClasses( li, this._getVisibles( li, create ), create );
		// autodividers binds to this to redraw dividers after the listview refresh
		this._trigger( "afterrefresh" );
	}}, $.mobile.behaviors.addFirstLastClasses ) );

$.mobile.listview.initSelector = ":jqmData(role='listview')";

//auto self-init widgets
$.mobile._enhancer.add( "mobile.listview" );

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");
