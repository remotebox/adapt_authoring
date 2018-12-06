// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var AssetModel = require('./models/assetModel');
  var AssetCollection = require('./collections/assetCollection');
  var AssetFilterView = require('./views/assetFilterWidgetView');
  var AssetManagementView = require('./views/assetManagementView');
  var AssetManagementNewAssetView = require('./views/assetManagementNewAssetView');
  var TagsCollection = require('core/collections/tagsCollection');

  var editAssetSidebarSettings = {
    actions: [
      { name: 'save', type: 'primary', labels: { default: 'buttons.save' } },
      { name: 'cancel', type: 'secondary', label: 'buttons.cancel' },
    ]
  };

  Origin.on('router:assetManagement', function(location, subLocation, action) {
    Origin.assetManagement = {
      filterData: {}
    };
    if(!location) return loadAssetsView();
    if(location === 'new') loadNewAssetView();
    if(subLocation === 'edit') loadEditAssetView(location);
  });

  Origin.on('globalMenu:assetManagement:open', function() {
    Origin.router.navigateTo('assetManagement');
  });

  Origin.on('origin:dataReady login:changed', function() {
    Origin.globalMenu.addItem({
      "location": "global",
      "text": Origin.l10n.t('buttons.assetmanagement'),
      "icon": "fa-file-image-o",
      "callbackEvent": "assetManagement:open",
      "sortOrder": 2
    });
  });

  function loadAssetsView() {
    (new TagsCollection()).fetch({
      success: function(tagsCollection) {
        // Load asset collection before so sidebarView has access to it
        // No need to fetch as the collectionView takes care of this
        // Mainly due to serverside filtering
        var assetCollection = new AssetCollection();
        var filterView = new AssetFilterView({ collection: tagsCollection });
        console.log(filterView.$el);
        Origin.sidebar.update({
          actions: [{ name: 'upload', type: 'primary', label: 'buttons.uploadnewasset' }],
          widgets: [filterView.$el]
        });
        Origin.contentPane.setView(AssetManagementView, { collection: assetCollection });
        Origin.trigger('assetManagement:loaded');
      },
      error: function() {
        console.log('Error occured getting the tags collection - try refreshing your page');
      }
    });
  }

  function loadNewAssetView() {
    Origin.sidebar.update(editAssetSidebarSettings);
    Origin.contentPane.setView(AssetManagementNewAssetView, { model: new AssetModel });
  }

  function loadEditAssetView(location) {
    // Fetch existing asset model
    (new AssetModel({ _id: location })).fetch({
      success: function(model) {
        Origin.sidebar.update(editAssetSidebarSettings);
        Origin.contentPane.setView(AssetManagementNewAssetView, { model: model });
      }
    });
  }
});
