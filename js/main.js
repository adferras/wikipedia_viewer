var app = angular.module('WikiViewer', ['ngAnimate', 'angucomplete-alt']);
app.controller('ctrl', function($scope, $http, $timeout) {
  var baseUrl = 'https://en.wikipedia.org/w/api.php?format=json&utf8=&callback=JSON_CALLBACK';
  var properties = '&action=query&prop=extracts|info|pageimages';
  var extracts = '&exchars=300&exlimit=10&exintro=&explaintext=&exsectionformat=plain';
  var searchGenerator = '&generator=search&redirects=&gsrsearch=';
  var url = baseUrl + properties + extracts;
  var opensearchUrl = baseUrl + '&action=opensearch&limit=10&namespace=0&search=';
  var autoCompleteTimeout, searchString;

  $scope.searchTxt = '';

  $scope.onKeyDown = function(event) {
    if (event.keyCode == 13 && $scope.searchTxt) {
      $scope.results = [];
      $scope.queryApi();
      $('form').datalist('getPanel').panel('close');
      }
    $scope.autocomplete($scope.searchTxt);
  };

  $('.button').on('click', function() {
    $('form').toggleClass('open');
    $('.instructions').toggleClass('hidden');
    $('input').toggleClass('hidden');
    $('input').focus();
    $('.close_button').toggleClass('close_the_x');
    $('.slash').toggleClass('close_the_slash');

    $scope.searchTxt = '';
    $scope.results = [];
    $scope.$apply();
  });

  $scope.autocomplete = function(str) {
    searchString = str;
    if (!autoCompleteTimeout) {
      autoCompleteTimeout = $timeout(function() {
        $scope.getSearchSuggestions();
        autoCompleteTimeout = '';
      }, 500);
    }
  };

  $scope.getSearchSuggestions = function() {
    var searchUrl = opensearchUrl + searchString;
    $http.jsonp(searchUrl)
      .success(function(data) {
        $scope.suggestions = data[1];
      })
      .error(function(data, status) {
        console.log(status);
      });
  };

  $scope.queryApi = function() {
    var query = $('input').val();

    $http.jsonp(url + searchGenerator + query).
    success(function(data) {
      var results = data.query.pages;
      angular.forEach(results, function(v, k) {
        $scope.results.push({
          title: v.title,
          body: v.extract,
          page: baseUrl + v.pageid
        });
      });
    }).
    error(function(data, status) {
      console.log(status);
    });
  };
});
