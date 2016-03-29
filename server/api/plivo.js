var plivo = Npm.require('plivo');


restApi.addRoute('plivo/new_call', { authRequired: false }, {
  post: {
    action: function() {
      var response = plivo.Response();
      var number = this.bodyParams.CallerName;
      var portingRequest = NumberPortingRequests.findOne({number: number});
      if(portingRequest) {
        var sayNameMessage = "Hello, thank you for using kisst. Please say your full name after the beep and press pound to confirm your number porting request.";
        response.addSpeak(sayNameMessage);
        response.addRecord({
          action: 'http://104.131.57.1:3001/api/plivo/recording_complete',
          maxLength: 10,
          playBeep: true
        });
      } else {
        var notFoundMessage = "Hello, you have reached kisst's number porting service. Unfortunately we were unable to find a porting request for the number you called from " + number + ".  Please ensure that you have already made a number porting request and that you are calling from that number.";
        response.addSpeak(notFoundMessage);
      }

      return xmlResponse(response);
    }
  }
});

function xmlResponse(plivoResponse) {
  return {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: '<?xml version="1.0" encoding="UTF-8" ?>' + plivoResponse.toXML()
  };
}

restApi.addRoute('plivo/recording_complete', { authRequired: false }, {
  post: {
    action: function() {
      var response = plivo.Response();
      var number = this.bodyParams.CallerName;
      var portingRequest = NumberPortingRequests.findOne({number: number});
      response.addSpeak("Thank you for confirming your ownership. We will now proceed with porting your number.");

      var now = new Date();
      NumberPortingRequests.update({ _id: portingRequest._id }, { $set: {ownershipConfirmedAt: now, recordingUrl: this.bodyParams.RecordUrl } });

      Email.send({
        to: 'porting@green-bot.com',
        from: "noreply@green-bot.com",
        subject: 'request to port ' + portingRequest.number,
      });

      return xmlResponse(response);
    }
  }
});

