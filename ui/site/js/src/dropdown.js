window.dropdown = (function() {

    var show_dropdown = function(args) {

        // create a base div to block mouse events
        var $base = $('<div></div>').css({
            zIndex: 60,
            position : 'fixed',
            top : 0,
            left : 0,
            width : '100%',
            height : '100%',
            backgroundColor : 'rgba(0,0,0,0)'
        });
        $('body').append($base);

        function fadeout() {
            $base.fadeOut(200, function() { $base.remove(); });
        }

        $base.bind('click', function(event) {
            fadeout();
            window.budjettipeli.enable_main_content();
            selected_event.fire();
            event.preventDefault();
            event.stopPropagation();
        });

        var $popup = $(args.template);
        var $selected = $popup.find('.selected');
        var parent = $selected.parent();
        $selected.remove();
        $selected.prependTo(parent);

        var $button = $popup.find('button');
        $button.remove();

        $popup.find('.options').append(
             _.map(args.options, function(option) {
                var $it = $button.clone();
                $it.attr('value', option.value);
                $it.find('.value').html(option.label);
                var current_value = args.bind.object[args.bind.property];
                if (option.value === current_value) {
                    $it.addClass('selected');
                }
                return $it;
            })
        );

        $popup.bind('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });

        $base.empty();
        $base.append($popup);
        $base.show();

        // make sure that the popup is correctly positioned
        var popup_offset = $popup.find('.wedge').offset();
        var menu_offset = args.$trigger.find('.wedge').offset();
        var orig_offset = $popup.offset();

        $popup.offset({
            top: orig_offset.top - popup_offset.top + menu_offset.top,
            left: orig_offset.left - popup_offset.left + menu_offset.left
        });

        var selected_event = aux.event();

        $popup.find('button').bind('click', function(event) {
            var value = $(this).attr('value');
            selected_event.fire(_.where(args.options, { value : value })[0]);
            fadeout();
            event.preventDefault();
            event.stopPropagation();
        });

        return {
            on_selected : selected_event.react
        }
    };

    var bind_button = function(args) {
        function update_button() {
            var value = args.bind.object[args.bind.property];
            var label = _.where(args.options, { value : value } )[0].label;
            args.$trigger.find('.value').html(label);
        }
        update_button();

        args.$trigger.bind('click', function(event) {
            var $button = $(this);
            var dropdown = show_dropdown(args);

            dropdown.on_selected(function(option) {
                window.budjettipeli.enable_main_content();
                if (option) {
                    args.bind.object[args.bind.property] = option.value;
                    $button.find('.value').html(option.label);
                    args.on_selected(option.value);
                }
            });

            window.budjettipeli.disable_main_content();
            event.preventDefault();
        });

    };

    return {
        show : show_dropdown,
        bind_button : bind_button
    };
})();