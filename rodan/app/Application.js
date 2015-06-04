import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import Router from './Router';
import Events from './Events';
import Configuration from './Configuration';
import ServerController from './Shared/ServerController';
import AuthenticationController from './Shared/AuthenticationController';
import ProjectCollection from './Project/ProjectCollection';
import NavigationCollection from './Shared/NavigationCollection';
import Project from './Project/Project';

import LoginView from './User/LoginView';
import AppLayoutView from './Shared/AppLayoutView';
import NavigationCollectionView from './Shared/NavigationCollectionView';
import ProjectCollectionView from './Project/ProjectCollectionView';

class RodanClient extends Marionette.Application
{
    initialize()
    {
        this.appConfiguration = Configuration;

        this.rodanChannel = Radio.channel('rodan');
        // when a request is made for the current application, respond with this instance.
        this.rodanChannel.reply(Events.CurrentApplication, this);

        this.router = new Router();
        this.serverController = new ServerController(this.appConfiguration);
        this.authenticationController = new AuthenticationController(this.serverController);

        this.appLayoutView = new AppLayoutView();
        this.navigationCollection = new NavigationCollection();
        this.appLayoutView.render();

        this.rodanChannel.on(Events.AuthenticationSuccess, () =>
        {
            this.initializeNavigation();
            this.currentProject = new Project();

            this.projectCollection = new ProjectCollection();
            this.appLayoutView.getRegion('content').show(new ProjectCollectionView({collection: this.projectCollection}));
            this.projectCollection.fetch();
        });

        this.rodanChannel.on(Events.ServerWentAway, () =>
        {
            // do something great.
        });
    }

    initializeNavigation()
    {
        this.navigationCollection.reset([
            {
                name: 'Projects',
                route: 'projects'
            },
            {
                name: 'Log out',
                route: 'logout'
            }
        ]);
    }

    onStart()
    {
        if (!Backbone.history.started)
            Backbone.history.start({pushState: true});
    }
}

export default RodanClient;