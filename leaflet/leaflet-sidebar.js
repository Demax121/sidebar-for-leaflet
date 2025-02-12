/* global L */

L.Control.Sidebar = L.Control.extend({
    // Include event handling capabilities
    includes: (L.Evented.prototype || L.Mixin.Events),

    options: {
        position: 'left'
    },

    initialize: function (id, options) {
        L.setOptions(this, options);

        // Get main elements
        this._sidebar = L.DomUtil.get(id);
        this._container = this._sidebar.querySelector('.sidebar__content');
        
        // Add positioning class following BEM conventions
        L.DomUtil.addClass(this._sidebar, `sidebar--${this.options.position}`);
        
        // Add touch styling if needed
        if (L.Browser.touch) {
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');
        }

        // Store interactive elements using BEM selectors
        this._tabitems = this._sidebar.querySelectorAll('.sidebar__tabs-item');
        this._panes = this._container.querySelectorAll('.sidebar__pane');
        this._closeButtons = this._sidebar.querySelectorAll('.sidebar__pane-close');
    },

    addTo: function (map) {
        this._map = map;

        // Add click handlers
        this._tabitems.forEach(item => {
            const link = item.querySelector('.sidebar__tabs-link');
            if (link?.getAttribute('href')?.startsWith('#')) {
                L.DomEvent
                    .on(link, 'click', L.DomEvent.preventDefault)
                    .on(link, 'click', () => this._handleTabClick(item));
            }
        });

        this._closeButtons.forEach(button => {
            L.DomEvent.on(button, 'click', this.close, this);
        });

        return this;
    },

    remove: function () {
        // Remove click handlers
        this._tabitems.forEach(item => {
            const link = item.querySelector('.sidebar__tabs-link');
            L.DomEvent.off(link, 'click');
        });

        this._closeButtons.forEach(button => {
            L.DomEvent.off(button, 'click');
        });

        this._map = null;
        return this;
    },

    open: function(id) {
        // Update pane visibility
        this._panes.forEach(pane => {
            if (pane.id === id) {
                L.DomUtil.addClass(pane, 'sidebar__pane--active');
            } else {
                L.DomUtil.removeClass(pane, 'sidebar__pane--active');
            }
        });

        // Update tab highlighting
        this._tabitems.forEach(item => {
            const link = item.querySelector('.sidebar__tabs-link');
            if (link.hash === '#' + id) {
                L.DomUtil.addClass(item, 'sidebar__tabs-item--active');
            } else {
                L.DomUtil.removeClass(item, 'sidebar__tabs-item--active');
            }
        });

        // Expand sidebar if collapsed
        if (L.DomUtil.hasClass(this._sidebar, 'sidebar--collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'sidebar--collapsed');
        }

        this.fire('pane__content', { id: id });
        return this;
    },

    close: function() {
        // Remove active highlights
        this._tabitems.forEach(item => {
            L.DomUtil.removeClass(item, 'sidebar__tabs-item--active');
        });

        // Collapse sidebar
        if (!L.DomUtil.hasClass(this._sidebar, 'sidebar--collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'sidebar--collapsed');
        }

        return this;
    },

    _handleTabClick: function(tab) {
        if (L.DomUtil.hasClass(tab, 'sidebar__tabs-item--active')) {
            this.close();
        } else if (!L.DomUtil.hasClass(tab, 'sidebar__tabs-item--disabled')) {
            this.open(tab.querySelector('.sidebar__tabs-link').hash.slice(1));
        }
    }
});

// Factory function
L.control.sidebar = function (id, options) {
    return new L.Control.Sidebar(id, options);
};