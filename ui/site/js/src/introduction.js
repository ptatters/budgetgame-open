(function() { "use strict";
    var aux = window.aux;
    var $ = window.$;
    var log = aux.log;


    function hide_sankey (box_number) {

        var sankey = d3.select('#sankey_svg');
        var nodes = sankey.select('.sankey_nodes');
        var links = sankey.select('.sankey_links');
        var texts = sankey.select('.sankey_texts');
        var icons = sankey.select('.sankey_icons');


        function show (node, value) {
            value = value || 1;
            node.style('opacity', value)
        }

        var faded_opacity = 0.3;

        function hide (node, value) {
            node.style('opacity', value || faded_opacity)
        }

        // show everything
        if (box_number == null) {

            // show everything
            show(nodes.selectAll('g'))
            show(links.selectAll('path'), faded_opacity)
            show(icons.selectAll('image'))

            show(texts.selectAll('text'))
            show(texts.selectAll('polyline'))
            show(texts.selectAll('circle'))
            show(sankey.selectAll('.sankey_label'));

            // gide orange rects for dynamic expense nodes
            for (var i = 14; i < 19; i++) {
                var rects = nodes.select('#snode'+i).selectAll('.snode_rect');
                show( d3.select( rects[0][0] ));
                show( d3.select( rects[0].slice(-1)[0] ));
            }

            return;
        }


        if (box_number > 5) {
            // show everything
            show(nodes.selectAll('g'))
            show(links.selectAll('path'), faded_opacity)

            show(texts.selectAll('text'))
            show(texts.selectAll('polyline'))
            show(texts.selectAll('circle'))
            show(sankey.selectAll('.sankey_label'));

            // hidden in all views
            hide(icons.selectAll('image'))
            hide(nodes.select('#snode23'));
            hide(texts.select('#susetext23'));

            show(icons.select('#sline7'));
            show(icons.select('#sline9'));

            return;

        } else {
            // hide everything
            hide(nodes.selectAll('g'))
            hide(links.selectAll('path'), 0.13)

            hide(texts.selectAll('text'))
            hide(texts.selectAll('polyline'))
            hide(texts.selectAll('circle'))

            // hidden in all views
            hide(icons.selectAll('image'))
            hide(nodes.select('#snode23'));
            hide(texts.select('#susetext23'));
        }
        if (box_number < 3){
            hide(sankey.selectAll('.sankey_label'));
            return;
        }else{
            show(sankey.selectAll('.sankey_label'));
        }

        // show nodes
        show(nodes.select('#snode8'));
        for (var i = 10; i < 19; i++) {
            show(nodes.select('#snode'+i));
        }

        // show links
        for (var i = 8; i < 25; i++) {
            show(links.select('#spathlink'+i), faded_opacity);
        }
        for (var i = 17; i < 24; i+=2) {
            hide(links.select('#spathlink'+i), 0.13);
        }

        // show texts
        show(texts.select('#susetext8'));
        for (var i = 10; i < 19; i++) {
            show(texts.select('#susetext'+i));
        }

        // gide orange rects for dynamic expense nodes
        for (var i = 14; i < 19; i++) {
            var rects = nodes.select('#snode'+i).selectAll('.snode_rect');
            hide( d3.select( rects[0][0] ));
            hide( d3.select( rects[0].slice(-1)[0] ));
        }

        if (box_number == 3) return;

        // show nodes
        show(nodes.select('#snode9'));
        show(texts.select('#susetext9'));
        for (var i = 0; i < 3; i++) {
            show(nodes.select('#snode'+i));
            show(texts.select('#susetext'+i));
        }
        // show links
        show(links.select('#spathoverflow34'), faded_opacity);
        show(texts.select('#susetextoverflow34'));

        show(links.select('#spathlink1'), faded_opacity);
        show(texts.select('#susetextlink1'));
        for (var i = 1; i < 5; i++) {
            show(links.select('#spathlink'+i), faded_opacity);
        }
        show(icons.select('#sline9'));

        if (box_number == 4) return;

        // gide orange rects for dynamic expense nodes
        for (var i = 14; i < 19; i++) {
            var rects = nodes.select('#snode'+i).selectAll('.snode_rect');
            show( d3.select( rects[0][0] ));
            show( d3.select( rects[0].slice(-1)[0] ));
        }

        // show nodes
        show(nodes.select('#snode6'));
        show(texts.select('#susetext6'));
        for (var i = 19; i < 23; i++) {
            show(nodes.select('#snode'+i));
            show(texts.select('#susetext'+i));
        }
        // show links
        show(links.select('#spathlink15'), faded_opacity);
        show(links.select('#spathlink17'), faded_opacity);
        for (var i = 19; i < 30; i++) {
            show(links.select('#spathlink'+i), faded_opacity);
        }
    }

    // Center intro-boxes relative to sankey diagram.
    function position_box (box_number, $box) {

        //var diagram = d3.select('#diagram');
        var width = $('#diagram').width(); //diagram.node().offsetWidth;
        var boxwidth = $box.width();

        // center
        if (box_number < 3 || box_number > 7) {
            $box.css('left', ((width - boxwidth)/2) + 'px');
        } // left
        else if (box_number == 3) {
            $box.css('left', (width*0.4 - 322) + 'px');
        } // left
        else if (box_number == 5) {
            $box.css('left', (width*0.4 - 352) + 'px');
        } // right
        else {
            $box.css('left', (width*0.65) + 'px');
        }
    };

    $(function() {
        //====================================================================
        //  Intro
        //====================================================================

        // find the intro base element
        var $base = $('.intro-base');
        var $box;

        function intro_setup(box_number){
            $('.intro-base').fadeIn(600);
            $('.header').addClass('faded');
            show_intro_box(box_number+1);
            window.budjettipeli.disable_main_content();
        }

        // retrieve the intro box template
        var intro_box_template_html = $('.intro-box-template').html();

        // retrieve the intro box content templates as an array
        var intro_box_content_html = _.map(
            $('.intro-box-content-templates').find('.intro-box-content').toArray(),
            function (box) {
                return $(box).html();
            }
        );
        var intro_box_count = intro_box_content_html.length;
        var intro_visible = false;

        function open_intro(box){
            if(intro_visible){
                change_box(box);
            }else{
                intro_setup(box);
            }
        }

        function close_intro(){
            if(intro_visible){
                hide_sankey(null);
                fadeout_and_remove($box);
                $base.fadeOut(400);
                $('.header').removeClass('faded');
                window.budjettipeli.enable_main_content();
                intro_visible = false;
                $('#effects-box, #share-box').css('display', 'block');
            }
        }

        function change_box(box){
            fadeout_and_remove($box);
            show_intro_box(box+1);
        }

        function fadeout_and_remove(oldbox) {
            if(!oldbox) return;
             oldbox.fadeOut({
                duration: 400,
                complete: function() { oldbox.remove(); }
            });
        }

        var intro_controller = {
            'open': open_intro,
            'close': close_intro
        };

        // function that shows one intro box, with numbers starting with 1.
        function show_intro_box(box_number) {
            log("show_intro", box_number);
            var index = box_number-1;
            intro_visible = true;

            hide_sankey(box_number);

            // create a new intro box and fade it in.
            $base.append(intro_box_template_html);
            $box = $base.find('.intro-box');
            $box.addClass('intro-box' + box_number);
            $box.prepend(intro_box_content_html[index]);
            // position box
            position_box(box_number, $box);
            $box.hide();
            $box.fadeIn(400);
        }
    /* export intro controller object */
    window.intro = intro_controller;
    });
})();
