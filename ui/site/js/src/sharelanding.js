/* global $ */
window.sharelanding = (function() { "use strict";
	var aux = window.aux;
	var is_visible = false;
	function show(has_solution){
		if(is_visible) return;
		var sl = $('.sharelanding');
		if(!has_solution){
			sl.addClass("nosolution");
		}
		$('.base-page').fadeTo(100, 0.3);
		$('.header').addClass('faded');
		sl.css({ display : 'block' });
		is_visible = true;
	}
	function hide(){
		if(!is_visible) return;
		$('.base-page').fadeTo(100, 1);
		$('.header').removeClass('faded');
		$('.sharelanding').css({ display : 'none' });
		is_visible = false;
		window.footer.show();
		window.footer.open_intro();
	}

	$(function(){
		$('.sl-new').on('click', function(){
			window.application_state.reset();
			window.budjettipeli.recreate_sankey();
			$('.share-section .budget_title').val('');
			$('.share-section .budget_description').val('');
			hide();
		});
		$('.sl-open').on('click', function(){
			hide();
		});
		var model, values;
		if(window.application_state.budget_info){ // state has budget_info if it is a saved solution from server
			model = window.budjettipeli_model.calculate(window.application_state);
			values = [
				aux.format_decimal(model['2025'].debt_gdb_ratio*100, 1),
				aux.format_decimal(model['2025'].deficit_gdb_ratio*100, 1),
				aux.format_decimal(model['2025'].service_deficit, -1),
				window.application_state.career_adjustment,
				window.application_state.gdb_adjustment
			];
			$('.solutionparameters .solutionvalue').each(function(index){
				$(this).html(values[index]);
			});
			$('.sl-left h3 a').text(window.application_state.budget_info.title);
			show(true);
		}else{
			show(false);
		}
	});

	//export control object
	return {
		show: show,
		hide: hide
	}
})();