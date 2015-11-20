/**
 * Plone snippet Plugin
 *
 * @author Davide Moro (inspired by Maurizio Lupo's redomino.tinymceplugins.snippet)
 */
(function() {
    var defaultTabsItem, emptyParagraph, tabsItemHeaderSource, tabsItemBodySource,
        tabsItemHeaderTemplate, tabsItemBodyTemplate,
        tabsSource, tabsTemplate, addTabsCondition, tabsCondition, version;

    version = '0.1';

    addTabsCondition = function (ed, element) {
        return ! (ed.dom.getParent(element, '.sweet-tabs') || ed.dom.getParent(element, '.panel-heading'));
    };
    tabsCondition = function (ed, element) {
        return ed.dom.getParent(element, '.sweet-tabs');
    };

    // templates
    defaultTabsItem = {
        header: 'Header',
        body: '<p>Body</p>'
    };
    emptyParagraph = '<p></p>';
    tabsItemHeaderSource = '<li role="presentation" class="{{#if @first}}active{{/if}}">' +
        '  <a href="#{{random1}}-{{@index}}" aria-controls="{{random1}}-{{@index}}" role="tab" data-toggle="tab">{{header}}</a></li>';
    tabsItemBodySource = '<div role="tabpanel" class="tab-pane {{#if @first}}active{{/if}}" id="{{random1}}-{{@index}}">{{{body}}}</div>';
    tabsSource = emptyParagraph +
        '<div class="sweet-tabs">' +
        '  <ul class="nav nav-tabs" role="tablist">' +
        '    {{#each items}}' +
        '    {{> tabsItemHeader random1=../random1}}' +
        '    {{/each}}' +
        '  </ul>' +
        '  <div class="tab-content">' +
        '    {{#each items}}' +
        '    {{> tabsItemBody random1=../random1}}' +
        '    {{/each}}' +
        '  </div>' +
        '</div>' + emptyParagraph;

    tabsItemHeaderTemplate = Handlebars.compile(tabsItemHeaderSource);
    Handlebars.registerPartial('tabsItemHeader', tabsItemHeaderTemplate);
    tabsItemBodyTemplate = Handlebars.compile(tabsItemBodySource);
    Handlebars.registerPartial('tabsItemBody', tabsItemBodyTemplate);
    tabsTemplate = Handlebars.compile(tabsSource);

    tinymce.PluginManager.requireLangPack('tabs');
    tinymce.create('tinymce.plugins.TabsPlugin', {
        init: function(ed, url) {
            var buttons;

            // buttons
            buttons = [
                ['tabs',
                 {title: 'tabs.desc',
                  cmd: 'mceTabs',
                  image: url + '/img/tabs.gif',
                  icon: 'tabs'
                 },
                 addTabsCondition
                ],
                ['tabsDelete',
                 {title: 'tabs.deletedesc',
                  cmd: 'mceTabsDelete',
                  image: url + '/img/tabs-delete.gif',
                  icon: 'tabs-delete'
                  },
                  tabsCondition
                ],
                ['tabsItemDelete', {
                  title: 'tabs.itemdeletedesc',
                  cmd: 'mceTabsItemDelete',
                  image: url + '/img/tabs-item-delete.gif',
                  icon: 'tabs-item-delete'
                  },
                  tabsCondition
                ],
                ['tabsItemInsertAfter', {
                  title: 'tabs.iteminsertafterdesc',
                  cmd: 'mceTabsItemInsert',
                  ui: true,
                  image: url + '/img/tabs-item-insert-after.gif',
                  icon: 'tabs-item-insert-after'
                  },
                  tabsCondition
                ],
                ['tabsItemInsertBefore', {
                  title: 'tabs.iteminsertbeforedesc',
                  cmd: 'mceTabsItemInsert',
                  ui: false,
                  image: url + '/img/tabs-item-insert-before.gif',
                  icon: 'tabs-item-insert-before'
                  },
                  tabsCondition
                ]
            ];

            // contextual controls
            ed.onInit.add(function() {
                if (ed && ed.dom.loadCSS) {
                    // load plugin's css
                    ed.dom.loadCSS(url + '/css/tabs.css?version=' + version);
                }
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function(plugin, menu, element) {
                        var groupMenu;
                        if (! ed.dom.getParent(element, '.panel-heading')) {
                            // Don't add the tabs contextmenu if we are
                            // inside an accordion/collapsable header
                            if (ed.dom.getParent(element, '.nav-tabs')) {
                                menu.removeAll();
                            } else {
                                menu.addSeparator();
                            }
                            groupMenu = menu.addMenu({title : 'tabs.group'});
                            tinymce.each(buttons, function (item){
                                var condition;
                                condition = item[2];
                                if (! condition || condition(ed, element)) {
                                    groupMenu.add(item[1]);
                                }
                            });
                        }
                    });
                }

                // Events
                ed.onNodeChange.add(function(ed, cm, e) {
                    // Prevent the p
                    var pElem, parentNode, found;
                    parentNode = e.parentNode;
                    if (e.nodeName == 'BR' && ed.dom.hasClass(parentNode, 'tab-pane')) {
                        tinymce.each(parentNode.childNodes, function (block) {
                            if (block.nodeName === 'P') {
                                found = true;
                            }
                        });
                        if (! found) {
                            pElem = ed.dom.create('p', {}, '&nbsp;');
                            parentNode.appendChild(pElem);
                            ed.dom.remove(e);
                            ed.selection.select(pElem);
                        }
                    }
                });

                ed.onKeyDown.addToTop(function(ed, e) {
                    var range, elem, tabsRootSelector, textContentLength, keyCode, moveKeys, selectedBlocks, found, parent1, parent2;

                    found = false;
                    keyCode = e.keyCode;
                    tabsRootSelector = '.sweet-tabs';
                    moveKeys = [37, 38, 39, 40];
                    elem = ed.selection.getNode();
                    selectedBlocks = ed.selection.getSelectedBlocks();
                    range = ed.selection.getRng();

                    if (! e.shiftKey) {
                        console.log('--------------------------');
                        console.log('keyCode');
                        console.log(keyCode);
                        console.log('elem');
                        console.log(elem);
                        console.log('selected blocks');
                        console.log(selectedBlocks);
                        console.log('start container');
                        console.log(range.startContainer);
                        console.log('start offset');
                        console.log(range.startOffset);
                        console.log('end container');
                        console.log(range.endContainer);
                        console.log('end offset');
                        console.log(range.endOffset);
                        console.log('END');
                    }

                    // TODO START check this
                    if (ed.dom.hasClass(ed.dom.getNext(elem, '*'), 'sweet-tabs') && keyCode === 46) {
                        // Prevent .sweet-tabs delete
                        return tinymce.dom.Event.cancel(e);
                    }
                    if (ed.dom.hasClass(ed.dom.getPrev(elem, '*'), 'sweet-tabs') && keyCode === 8) {
                        // Prevent .sweet-tabs delete
                        return tinymce.dom.Event.cancel(e);
                    }
                    // END check this

                    // Prevent edit where it shouldn't be possible (mceNotEditable/mceEditable doesn't
                    // work on older versions of TinyMCE)
                    if (ed.dom.getParent(elem, tabsRootSelector)) {
                        if (moveKeys.indexOf(keyCode) === -1) {
                            // Ignore movement keys (arrows)
                            // Prevent element duplication due to "return" key or undesired
                            // editing in not allowed areas (mceNonEditable does not work as
                            // expected on this particular version).
                            if (keyCode === 13) {
                                // we should prevent shift+enter if we are inside of .panel-heading
                                if (ed.dom.getParent(elem, '.nav-tabs')) {
                                    return tinymce.dom.Event.cancel(e);
                                }
                            }
                            // Prevent undesired tabs markup removals
                            // pressing back delete or canc
                            if (keyCode === 8 || keyCode === 46) {
                                textContentLength = elem.textContent.length;

                                if ((keyCode === 8 && range.startOffset === 0) ||
                                   (keyCode === 46 && range.startOffset === textContentLength)) {
                                    if (ed.dom.getParent(elem, '.nav-tabs')) {
                                        // prevent delete/backspace on headers a
                                        return tinymce.dom.Event.cancel(e);
                                    } else if (ed.dom.hasClass(elem.parentNode, 'tab-pane')) {
                                       // prevent deleve/backspace on last/first p child of tab-pane
                                       if (keyCode === 8 && elem.parentNode.firstChild === elem) {
                                            return tinymce.dom.Event.cancel(e);
                                       } else if (keyCode === 46 && elem.parentNode.lastChild === elem) {
                                            return tinymce.dom.Event.cancel(e);
                                       }
                                    }
                                } else {
                                    // special case for keyCode === 8 && range.startOffset === 1
                                    // && header a element. If you remove the last character from
                                    // an 'a' node, tinymce erase the entire node instead of leaving
                                    // it empty. This is bad since the 'a' node is required by
                                    // bootstrap, so we need a special rule here.
                                    // The exact opposite for keyCode === 46
                                    if (textContentLength === 1 || textContentLength === range.endOffset) {
                                        // the textContentLength == range.endOffset condition is for cursor at the end
                                        // of the header, shift+startline and canc
                                        if ((keyCode === 8 && range.startOffset === 1) || (keyCode === 46 && range.startOffset === 0) || (keyCode === 46 && range.endOffset === textContentLenght)) {
                                            if (elem.nodeName === 'A' && ed.dom.getAttrib(elem, 'role', undefined) === 'tab') {
                                                elem.innerHTML = '&nbsp;';
                                                return tinymce.dom.Event.cancel(e);
                                            }
                                            if (elem.nodeName === 'LI' && ed.dom.hasClass(elem.parentNode, 'nav-tabs')) {
                                                return tinymce.dom.Event.cancel(e);
                                            }
                                        }
                                    } else if (selectedBlocks.length === 1) {
                                        // we are deleting chars in the header
                                        return;
                                    } else {
                                        // check if we are removing required bootstrap markup
                                        tinymce.each(selectedBlocks, function (block) {
                                            if (ed.dom.hasClass(block, 'tab-pane') || ed.dom.hasClass(block, 'sweet-tabs') || ed.dom.hasClass(block, 'nav-tabs') || ed.dom.hasClass(block, 'tab-content') || ed.dom.hasClass(block.parentNode, 'nav-tabs')) {
                                                found = true;
                                            }
                                        });
                                        if (found) {
                                            return tinymce.dom.Event.cancel(e);
                                        }
                                        return;
                                    }
                                }
                            } else {
                                // all other keys
                                if (elem.nodeName === 'LI' && ed.dom.getAttrib(elem, 'role') === 'presentation' && ed.dom.hasClass(elem.parentNode, 'nav-tabs')) {
                                    return tinymce.dom.Event.cancel(e);
                                } else if (elem.nodeName === 'DIV' && ed.dom.hasClass(elem, 'sweet-tabs')) {
                                    return tinymce.dom.Event.cancel(e);
                                } else if (elem.nodeName === 'UL' && ed.dom.hasClass(elem, 'nav-tabs')) {
                                    return tinymce.dom.Event.cancel(e);
                                } else if (elem.nodeName === 'DIV' && ed.dom.hasClass(elem, 'tab-content')) {
                                    return tinymce.dom.Event.cancel(e);
                                }
                            }
                        }
                    } else if (keyCode === 8 || keyCode === 46) {
                        if (selectedBlocks.length >= 1) {
                            if (ed.dom.hasClass(elem, 'tab-content')) {
                                tinymce.each(selectedBlocks, function (block) {
                                    if (block.nodeName === 'P' && ed.dom.hasClass(block.parentNode, 'tab-pane')) {
                                        // TODO: check offset
                                        ed.dom.setHTML(block, '&nbsp;');
                                        found = true;
                                    }
                                });
                            } else if (ed.dom.hasClass(elem, 'nav-tabs')) {
                                tinymce.each(selectedBlocks, function (block) {
                                    var firstChild = block.firstChild;
                                    if (ed.dom.hasClass(block.parentNode, 'nav-tabs') && firstChild.nodeName === 'A') {
                                        ed.dom.setHTML(firstChild, '&nbsp;');
                                        found = true;
                                    }
                                });
                            } else if (elem.nodeName === 'LI' && ed.dom.getAttrib(elem, 'role') === 'presentation' && ed.dom.hasClass(elem.parentNode, 'nav-tabs')) {
                                // Do nothing, the editor is trying to delete things on the LI element
                                found = true;
                            } else {
                                // Avoid clear elements with transelection.
                                // If you select the paragraph before the tab and the first
                                // header you'll get the header with empty text and the paragraph
                                // untouched. Both or none.

                                if (! e.shiftKey) {
                                    console.log('breakpoint');
                                }
                                parent1 = ed.dom.getParent(selectedBlocks[0], '.sweet-tabs');
                                parent2 = ed.dom.getParent(selectedBlocks[selectedBlocks.length-1], '.sweet-tabs');
                                if (parent1 && parent2 && parent1 === parent2) {
                                    if (! e.shiftKey) {
                                        console.log('breakpoint');
                                    }
                                    if (selectedBlocks.length < 2) {
                                        // TODO: check this
                                        // shift+startline/endline + canc
                                        return;
                                    }
                                    // TODO: remove event cancel and override tinymce's default policy
                                    return tinymce.dom.Event.cancel(e);
                                } else if (parent1 || parent2) {
                                    // no trans selection
                                    return tinymce.dom.Event.cancel(e);
                                }

                            }
                            if (found) {
                                return tinymce.dom.Event.cancel(e);
                            }
                            return;
                        }
                    }
                });
            });

            // Register commands
            ed.addCommand('mceTabsDelete', function() {
                // remove the whole tabs
                var selected, tabs;

                selected = ed.selection.getNode();
                tabs = ed.dom.getParent(selected, '.sweet-tabs');
                ed.dom.remove(tabs);
            });
            ed.addCommand('mceTabsItemDelete', function() {
                // delete the selected tabs item. If it is the last one,
                // the entire tabs will be removed
                var selected, toBeRemoved1, parent1, toBeRemoved2, parent2,
                    index, containerSelectors, next1, next2, tabsContainer, tabSelectors;

                containerSelectors = '.nav-tabs,.tab-content';
                tabSelectors = '.nav-tabs li,.tab-pane';

                selected = ed.selection.getNode();
                toBeRemoved1 = ed.dom.getParent(selected, tabSelectors);
                next1 = ed.dom.getNext(toBeRemoved1, tabSelectors);
                if (!next1 && ! ed.dom.getPrev(toBeRemoved1, tabSelectors)) {
                    // we are deleting the last elem, there is no prev and no next tab item
                    // so let's remote the whole tabs container
                    tabsContainer = ed.dom.getParent(toBeRemoved1, '.sweet-tabs');
                    if (tabsContainer) {
                        ed.dom.remove(tabsContainer);
                    }
                } else {
                    // there are more than one tab items
                    if (toBeRemoved1) {
                        parent1 = ed.dom.getParent(toBeRemoved1, containerSelectors);
                        if (parent1) {
                            parent2 = ed.dom.getNext(parent1, containerSelectors) || ed.dom.getPrev(parent1, containerSelectors);
                            if (parent2) {
                                index = ed.dom.nodeIndex(toBeRemoved1);
                                toBeRemoved2 = parent2.childNodes[index];
                                next2 = toBeRemoved2 ? ed.dom.getNext(toBeRemoved2, '.nav-tabs li,.tab-pane') : undefined;

                                if (toBeRemoved1 === parent1.firstChild && next1 && next2) {
                                    // we are removing the first child and there is a next elem
                                    ed.dom.addClass(next1, 'active');
                                    ed.dom.addClass(next2, 'active');
                                }
                                if (toBeRemoved2) {
                                    ed.dom.remove(toBeRemoved1);
                                    ed.dom.remove(toBeRemoved2);
                                }
                            }
                        }
                    }
                }
            });
            ed.addCommand('mceTabsItemInsert', function(after) {
                // insert another tabs, after or before the selected item
                var selected, randomString1, context, htmlHeader, htmlBody,
                    parent1, parent2, tabsItem1, tabsItem2, index, el1, el2, swap, containerSelectors;

                containerSelectors = '.nav-tabs,.tab-content';
                selected = ed.selection.getNode();
                parent1 = ed.dom.getParent(selected, containerSelectors);
                if (parent1) {
                    parent2 = ed.dom.getNext(parent1, containerSelectors) || ed.dom.getPrev(parent1, containerSelectors);
                    if (parent2) {
                        if (! ed.dom.hasClass(parent1, 'nav-tabs')) {
                            // parent1 -> header container
                            // parent2 -> body container
                            swap = parent2;
                            parent2 = parent1;
                            parent1 = swap;
                            tabsItem2 = ed.dom.getParent(selected, '.tab-pane');
                            index = ed.dom.nodeIndex(tabsItem2);
                            tabsItem1 = parent1.childNodes[index];
                        } else {
                            tabsItem1 = ed.dom.getParent(selected, '.nav-tabs li');
                            index = ed.dom.nodeIndex(tabsItem1);
                            tabsItem2 = parent2.childNodes[index];
                        }
                        randomString1 = Math.floor(10000 * (Math.random() % 1)).toString();
                        context = {};
                        context.header = defaultTabsItem.header;
                        context.body = defaultTabsItem.body;
                        context.random1 = randomString1;
                        htmlHeader = tabsItemHeaderTemplate(context);
                        htmlBody = tabsItemBodyTemplate(context);
                        el1 = ed.dom.create('div');
                        el2 = ed.dom.create('div');
                        if (after) {
                            ed.dom.insertAfter(el1, tabsItem1);
                            ed.dom.insertAfter(el2, tabsItem2);
                        } else {
                            parent1.insertBefore(el1, tabsItem1);
                            parent2.insertBefore(el2, tabsItem2);
                        }
                        ed.dom.setOuterHTML(el1, htmlHeader);
                        ed.dom.setOuterHTML(el2, htmlBody);

                        if (!after && ed.dom.hasClass(tabsItem1, 'active')) {
                            // if the current tabs item is the first one and we are
                            // prepending another tab item, we need to toggle the
                            // "active" class
                            ed.dom.removeClass(tabsItem1, 'active');
                            ed.dom.removeClass(tabsItem2, 'active');
                            ed.dom.addClass(parent1.firstChild, 'active');
                            ed.dom.addClass(parent2.firstChild, 'active');
                        }
                    }
                }
            });

            // Handle node change updates
            ed.onNodeChange.add(function(ed, cm, n) {
                // disable toolbar's buttons depending on the current selection
                tinymce.each(buttons, function (item) {
                    cm.setDisabled(item[0], !item[2](ed, n));
                });
                // TODO: remove "remove link" button for tab headers
            });

            ed.addCommand('mceTabs', function(length) {
                // add tabs
                var selected, selectedContent, content,
                    template,
                    context, html, index, iter,
                    randomString1 = Math.floor(10000 * (Math.random() % 1)).toString(),
                    randomString2 = Math.floor(10000 * (Math.random() % 1)).toString();
                context = {
                    items: [],
                    random1: randomString1,
                    random2: randomString2
                };

                selected = ed.selection.getNode();
                selectedContent = ed.selection.getContent();

                if (selectedContent) {
                    // selection

                    if (['p', 'table', 'b', 'a', 'br'].indexOf(selected.nodeName) !== -1) {
                        /* The initialization based on text selection only makes
                           sense for simple markup like the following:
                               <p>header1</p>
                               <p>body1</p>
                               <p>header2</p>
                               <p>body2</p>

                           Not like:
                               <p>header1<br />body1<br />header2<br />body2</p>
                        */
                        return;
                    }
                    tinymce.each(ed.selection.getSelectedBlocks(), function (child, index) {
                        var text = child.textContent,
                            odd = index % 2 === 0,
                            itemsLength = context.items.length,
                            lastItemIndex = itemsLength ? itemsLength - 1 : 0;
                        if (odd) {
                            // we use the header template
                            context.items.push({
                                header: text ? text : 'Header'
                            });
                        } else {
                            // we use the body template
                            if (!context.items[lastItemIndex].body) {
                                context.items[lastItemIndex].body = child.outerHTML;
                            }
                        }
                    });
                } else {
                    // no selection
                    if (arguments[1] !== undefined) {
                        for (iter=1; iter<=arguments[1]; iter++) {
                            context.items.push({header: 'Header ' + iter, body: '<p>Body ' + iter + '</p>'});
                        }
                    } else {
                        ed.windowManager.open({
                            file : url + '/tabs.html',
                            width : 430 + parseInt(ed.getLang('media.delta_width', 0)),
                            height : 500 + parseInt(ed.getLang('media.delta_height', 0)),
                            inline : 1
                            }, {
                            plugin_url : url
                           });
                    }

                }
                if (context.items.length) {
                    html = tabsTemplate(context);
                    ed.execCommand('mceInsertContent', false, html);
                }
            });

            // Register buttons
            tinymce.each(buttons, function (item){
                ed.addButton(item[0], item[1]);
            });

        },

        getInfo: function() {
            return {
                longname: 'Tabs Plugin',
                author: 'Davide Moro (@ Abstract srl for EEA)',
                authorurl: 'http://davidemoro.blogspot.it/',
                infourl: 'https://github.com/collective/collective.sweeteditor',
                version: version
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('tabs', tinymce.plugins.TabsPlugin);
})();
