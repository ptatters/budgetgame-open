/* global $ */
/* global d3 */
(function(){
    'use strict';
    var aux = window.aux;

    function Stepper(element, datamodel){
        var self = this;
        self.datamodel = datamodel;
        self.current_step = 0;
        self.current_substep = 0;
        self.root = d3.select(element);
        self.steps = self.root.selectAll('li').data(datamodel);

        var enter_steps = self.steps.enter().append('li').attr('class', 'stepper-step');
        enter_steps.append('span').attr('class', 'stepper-substeps');
        enter_steps.append('div').attr('class', 'stepper-step-number').text(function(d, i){return i+1;});
        enter_steps.append('span').attr('class', 'stepper-step-text').html(function(d, i){return d.name});
        
        self.render();
        self.steps.on('click', function(d, i){
            if(self.current_step === i){
                return false;
            }
            self.current_substep = 0;
            self.current_step = i;
            self.render();
            self.nav_event.fire({step: self.current_step, substep: self.current_substep});
        });
        self.nav_event = aux.event();
        self.on_navigation = self.nav_event.react;
    }
    Stepper.prototype = {
        'render': function(){
            var self = this;
            self.steps.classed('passed', function(d, i){return i <= self.current_step});
            self.root.selectAll('li > span.stepper-substeps').html(self.generate_substeps.bind(self));
        },
        'generate_substeps': function(d, i){
            var self = this;
            if(!d.substeps) return '';
            if(i === self.current_step){
                return '<span class="passed">' + Array(self.current_substep+2).join('●&thinsp;') + '</span>' + Array(d.substeps-self.current_substep).join('●&thinsp;');
            }
            if(i > self.current_step){
                return Array(d.substeps+1).join('●&thinsp;');
            }else{
                return '<span class="passed">' + Array(d.substeps+1).join('●&thinsp;') + '</span>';
            }
        },
        'substep_forward': function(){
            var self = this;
            var datamodel = self.datamodel;
            var change_major = false;
            if(!datamodel[self.current_step].substeps){
                change_major = true;
            }else{
                if(self.current_substep === datamodel[self.current_step].substeps-1){
                    change_major = true;
                }else{
                    self.current_substep++;
                }
            }
            if(change_major){
                if(self.current_step === datamodel.length-1) return;
                self.current_step++;
                self.current_substep = 0;
            }
            self.render();
            return {step: self.current_step, substep: self.current_substep};
        },
        'substep_back': function(){
            var self = this;
            var datamodel = self.datamodel;
            var change_major = false;
            if(!datamodel[self.current_step].substeps){
                change_major = true;
            }else{
                if(self.current_substep === 0){
                    change_major = true;
                }else{
                    self.current_substep--;
                }
            }
            if(change_major){
                if(self.current_step === 0) return;
                self.current_step--;
                if(!datamodel[self.current_step].substeps){
                    self.current_substep = 0;
                }else{
                    self.current_substep = datamodel[self.current_step].substeps-1;
                }
            }
            self.render();
            return {step: self.current_step, substep: self.current_substep};
        },
        'set_state': function(new_state){
            var self = this;
            self.current_step = new_state.step;
            self.current_substep = new_state.substep;
            self.render();
        }
    };

    function initFooter(){
        var stepper = new Stepper('#navstepper', [
            {'name': 'Esittely', 'substeps': 6},
            {'name': 'Budjetoi', 'substeps': 10},
            {'name': 'Katso ikä-<br>vaikutukset'},
            {'name': 'Tallenna/Jaa'}
        ]);
        var info_visible = false;
        var info_holder = $('.footer-info-holder');
        stepper.on_navigation(handle_change);
        d3.select('#footer-prev').on('click', function(){
            var state = stepper.substep_back();
            handle_change(state);
        });
        d3.select('#footer-next').on('click', function(){
            var state = stepper.substep_forward();
            handle_change(state);
        });
        set_arrow_state({step:0, substep:0});

        function set_arrow_state(state){
            d3.select('#footer-prev').classed('disabled', !state.step && !state.substep);
            d3.select('#footer-next').classed('disabled', state.step === 3);
        }
        function info_show(message, delay){
            if(!delay) delay = 0;
            info_holder.find('.footer-infobox').html(message);
            if(!info_visible){
                info_holder.delay(delay).fadeIn(200);
                info_visible = true;
            }
        }
        function info_hide(){
            if(info_visible){
                info_holder.fadeOut(10);
                info_visible = false;
            }
        }
        var paneSequence = [8,7,6,5,4,3,2,0,1]; // order in which to show questionnaires
        function handle_change(state){
            var sankey = window.budjettipeli.get_sankey();
            if(state.step === 0){
                intro.open(state.substep);
                if(state.substep === 0){
                    info_show('Etene budjettipelin vaiheesta toiseen painamalla tästä', 2000);
                }else{
                    info_hide();
                }
                aux.scroll_page_top(0, 400);
            }else{
                intro.close();
                if(state.step === 1){
                    if(state.substep === 0){
                        info_show('Ota kantaa eri palveluiden rahoitukseen sekä verotukseen painamalla joko kysymysmerkki-painikkeita tai tästä', 1000);
                    }else{
                        sankey.open_pane( paneSequence[state.substep - 1] );
                        info_hide();
                    }
                    aux.scroll_page_top(0, 400);
                }
                if(state.step === 2){
                    info_hide();
                    aux.scroll_page_top(540, 400);
                }
                if(state.step === 3){
                    info_hide();
                    aux.scroll_page_top(1170, 400);
                }
            }
            set_arrow_state(state);
        }
        $('.base-page').on('click', function() {
            info_hide();
        });
        return {
            open_intro: function(){
                var new_state = {step: 0, substep: 0};
                stepper.set_state(new_state);
                handle_change(new_state);
            },
            show: function(){
                d3.select('div.footer').style('bottom', '0px');
            },
            set_state: function(new_state){
                stepper.set_state(new_state);
                handle_change(new_state);
            },
            disable: function(){
                d3.select('div.footer').classed('disabled', true);
            },
            enable: function(){
                d3.select('div.footer').classed('disabled', false);
            }
        }
    }

    $(function(){
        window.footer = initFooter();
    });
})();

