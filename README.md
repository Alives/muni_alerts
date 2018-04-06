# muni_alerts
A javascript website that loads nextbus API xml feeds and displays specific
San Francisco MUNI stop information about those feeds.

I can take 2 different trains to/from work, and got tired of clicking through
the different levels of all the apps to get the information I wanted.  Instead
I have it right here, directly from the same API.

## Instructions
Follow the [NextBus API guide](https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf)
and find the stopIds you care about: 
[stopId xml list for J train](http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=J).  Adjust the `ROUTES` variable in muni.js
and replace the `KT`/`N` `routeTag` (trains) keys and their corresponding `stopId` (stations) to
match what you want.
