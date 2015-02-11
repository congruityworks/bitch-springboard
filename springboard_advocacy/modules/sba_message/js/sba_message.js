/**
 * @file
 */

/**
 * Advocacy recipients list  and search page
 */
(function ($) {
    Drupal.behaviors.AdvocacyMessageRecipients = {
        attach: function(context, settings) {

            // Append the search div to the message form, and the message form actions
            // to the search div.
            finder = $('.springboard-advocacy-find-targets-container');
            actions = $('#sba-message-edit-form #edit-actions');
            finder.append(actions);
            $('#sba-message-edit-form').append(finder);

            // Editing a pre-existing message, append the recipients
            // to the recipients div using hidden form value
            var recipients =  $('input[name="data[recipients]"]').val();
            if(recipients.length > 0) {
                $('body').once('edit-page', function() {
                   $(document).ready(function($){
                      buildEditPage(recipients);
                    });
                });
            }

            // Apply click event to the search form add links
            // Allows views search results to be appended to the recipients list
            links = $('a.advocacy-add-target, a#advo-add-all');
            links.each(function(){
                $(this, context).once('advocacy-add-target', function() {
                    $(this).click(function (e){
                        e.preventDefault();
                        var count;

                        if ($('.target-recipient').length !== 0) {
                            count = parseInt($('.target-recipient').last().attr('id').replace('target-', '')) + 1;
                        }
                        else {
                            count = 0;
                        }

                        var query = $(this).attr('href').replace('add-all?','').replace('add-target?','').split('&');
                        var readable = buildReadableQuery(query);
                        buildDivs(count, readable, query);
                        buildUpdateMessage();
                        buildFormValue();
                    });
                });
            });
        }
    };

    // Rebuild the recipients list on existing messages
    function buildEditPage(recipients) {
        var count = 0;
        $.each(JSON.parse(recipients), function(idx, obj) {
            var query = '';
            query = JSON.stringify(obj)
                .replace(/"/g, '')
                .replace(/,/g, '&')
                .replace(/:/g, '=')
                .replace('{', '')
                .replace('}', '')
                .split('&');

            var readable = buildReadableQuery(query);

            buildDivs(count,readable, query);
            count++;
        });
    }

    // Create the recipients list divs, apply data attributes which
    // will be aggregated as a JSON string used by a hidden form field
    // for submission to the API
    function buildDivs(count, readable, query) {
        $('#springboard-advocacy-message-recipients-content')
            .prepend('<div id = "target-' + count + '" class = "target-recipient" style="display: none;">' + readable +
            ' <span><a class ="target-delete" href="#">delete</a></span></div>');
        $('#target-' + count).show(300);
        $('#target-' + count + ' a').click(function(ev){
            ev.preventDefault();
            $(this).closest('.target-recipient').hide(300, function(){
                $(this).remove();
                buildUpdateMessage();
                buildFormValue();
            });

        })
        $(query).each(function(index, value) {
            value = value.split('=');
            $('#target-' + count).attr('data-' + value[0], value[1].replace(/%7C/g, '|'));
        });
    }

    // attaches JSONified data atrributes of the recipients list to a hidden form field
    function buildFormValue() {
        var arr = {};
        $('.target-recipient').each(function(i) {
            arr[i] = $(this).data();
        });
        recipients = JSON.stringify(arr).replace(/"/g, '&quot;');
        $('input[name="data[recipients]"]').val(recipients);
    }

    function buildUpdateMessage() {
        $('.sba-message-status').text('You have unsaved changes').show('slow');
    }

    // Takes a url query string from the search form "add" links
    // and builds readable text for the recipients list.
    function buildReadableQuery(query) {
        var queryObj = {};
        $(query).each(function(index, value) {
            var segments = value.split('=');
            segments[0] = segments[0].ucfirst();
            segments[1] = segments[1].replace(/%7C/, '|');
            queryObj[segments[0]] = segments[1].split('|');
            $(queryObj[segments[0]]).each(function(i, v){
                switch(v) {
                    case 'FR':
                        queryObj[segments[0]][i] = 'Federal Representatives';
                        break;
                    case 'SR':
                        queryObj[segments[0]][i] = 'State Representatives';
                        break;
                    case 'FS':
                        queryObj[segments[0]][i] = 'Federal Senators';
                        break;
                    case 'SS':
                        queryObj[segments[0]][i] = 'State Senators';
                        break;
                    case 'SX':
                        queryObj[segments[0]][i] = 'State Executives';
                        break;
                    case 'FX':
                        queryObj[segments[0]][i] = 'Federal Executive';
                        break;
                    case 'R':
                        queryObj[segments[0]][i] = 'Republicans';
                        break;
                    case 'D':
                        queryObj[segments[0]][i] = 'Democrats';
                        break;
                    case '0':
                        queryObj[segments[0]][i] = 'Other';
                        break;
                    case 'M':
                        queryObj[segments[0]][i] = 'Male';
                        break;
                    case 'F':
                        queryObj[segments[0]][i] = 'Female';
                        break;
                }
            });
        });

        if (typeof(queryObj.Id) !== 'undefined') {
            return "Individual: " + queryObj.Sal + " " +  queryObj.First + " " + queryObj.Last;
        }

        cleanUp = JSON.stringify(queryObj).jsonToReadable();
        if (typeof(queryObj.Fields) !== 'undefined' || typeof(queryObj.Gender) !== 'undefined'
            || typeof(queryObj.Social) !== 'undefined' ||  typeof(queryObj.District) !== 'undefined') {
            return "Multiple Individuals: " +  cleanUp;
        }
        return "Group: " +  cleanUp;
    }

    String.prototype.ucfirst = function()
    {
        return this.charAt(0).toUpperCase() + this.substr(1);
    }

    String.prototype.jsonToReadable = function()
    {
      return this.replace(/{"/g, '<ul><li>')
            .replace(/]}/g, '</li></ul>')
            .replace(/\["/g, '')
            .replace(/\],"/g, '</li><li>')
            .replace(/:/g, ': ')
            .replace(/","/g, ', ')
            .replace(/"/g, '')
    }

})(jQuery);