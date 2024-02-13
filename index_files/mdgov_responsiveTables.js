(function ($, window, document, undefined) {

    var pluginName = "responsiveTables",
        defaults = {
            header: "thead th",
            classes: {
				table: "ui-table",
                reflowTable: "ui-table-reflow",
		        cellLabels: "ui-table-cell-label",
			},
			initSelector: '.ms-listviewtable',
            mode: "reflow"
        };

    function Plugin(element, options) {
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {

        init: function () {
            var self = this;
			self.refresh(true);
        },

        refresh: function (create) {

            var self = this,
				trs = this.element.find( this.options.header ),
                options = this.options;

			if ( create ) {
				this.element.addClass( options.classes.table );
			}

            self.headers = this.element.find( "tr:eq(0)" ).children();

            self.allHeaders = trs.children();

            // 2. Normalize rowspan by creating rows for each
            if (this.element) {
                this.element.find('td[rowspan]').each(function () {
                    var cell = $(this),
                        row = cell.parent(),
                        index = cell.get(0).cellIndex,
                        count = parseInt(cell.attr('rowspan')) - 1;

                    var newCell = cell.clone().removeAttr('rowspan').addClass('ui-duplicated-cell');
                    var insertBefore;

                    while (count > 0) {
                        row = row.next();
                        insertBefore = row.find("td:nth-child(" + (index + 1) + ")");
                        if (insertBefore.length > 0)
                            insertBefore.before(newCell);
                        else row.find("td:last-child").after(newCell);

                        count--
                    }
                });
            }

            trs.each(function(){

				var coltally = 0;

				$( this ).children().each(function( i ){
                    
					var span = parseInt( $( this ).attr( "colspan" ), 10 ),
						sel = ":nth-child(" + ( coltally + 1 ) + ")";
					$( this )
						.data( "colstart", coltally + 1 );

					if( span ){
						for( var j = 0; j < span - 1; j++ ){
							coltally++;
							sel += ", :nth-child(" + ( coltally + 1 ) + ")";
						}
					}

					if ( create === undefined ) {
						$(this).data("cells", "");
					}
					// Store "cells" data on header as a reference to all cells in the same column as this TH
					$( this )
						.data( "cells", self.element.find( "tbody tr" ).not('[id=group0]').not( this ).children( sel ) );

					coltally++;

				});

                // update table modes
			    if ( create === undefined ) {
				    this.refresh();
			    }

			});

	        // If it's not reflow mode, return here.
	        if ( options.mode !== "reflow" ){
		        return;
	        }

	        if ( create ) {
		        this.element.addClass( options.classes.reflowTable );
	        }

	        // get headers in reverse order so that top-level headers are appended last
	        var reverseHeaders =  $( self.allHeaders.get().reverse() );

	        // create the hide/show toggles
	        reverseHeaders.each(function( i ){
		        var $cells = $( this ).data( "cells" ),
			        colstart = $( this ).data( "colstart" ),
			        hierarchyClass = $cells.not( this ).filter( options.header ).length && " ui-table-cell-label-top",
			        text = $(this).text();

			        if ( text !== ""  ){

				        if ( hierarchyClass ){
					        var iteration = parseInt( $( this ).attr( "colspan" ), 10 ),
						        filter = "";

					        if ( iteration ){
						        filter = "td:nth-child("+ iteration +"n + " + ( colstart ) +")";
					        }
					        $cells.filter( filter ).prepend( "<b class='" + options.classes.cellLabels + hierarchyClass + "'>" + text + "</b>"  );
				        }
				        else {
					        $cells.prepend( "<b class='" + options.classes.cellLabels + "'>" + text + "</b>"  );
				        }

			        }
	        });
            
        }
    };

    // Plugin wrapper
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "mdgov_" + pluginName)) {
                $.data(this, "mdgov_" + pluginName,
                new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);

$(document).ready(function () {
    $('.ui-responsive').responsiveTables({ header: "thead tr" });
    $('.ms-listviewtable').addClass('ui-responsive').responsiveTables({ header:"tr.ms-viewheadertr"});
});