/* globals angular, beforeEach, chai, describe, inject, it */
'use strict';

var expect = chai.expect;

describe('d3::', function() {
  var d3Service;

  beforeEach(module('d3'));

  beforeEach(inject(function(_d3Service_) {
    d3Service = _d3Service_;
  }));

  it('should load the script tag and resolve to the d3 object', inject(function() {
    var d3 = d3Service.d3();

    expect(d3).to.exist;
    expect(d3.select('body')).to.have.length(1);

  }));

});