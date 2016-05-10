node-red-contrib-aggregator
==============================

This node can be used to aggregate numeric values over a specific time span. 


#### Use cases:

1. combine more than one sensor inputs to one output (as a way to implement some sort of a simple sensor redundancy)
2. statistical aggregation of more than one inputs. Example: if you have five temperature sensors in a room, you will be able to calculate the average of their values to get the average room temperature (i.e. for a display)
3. statistical aggregation over a longer time period. Example: if you are only interested in the average day temperature, you could do this with the aggregator node too.
4. combination of values. Example: You have three push buttons and you want to switch a light when one of them is pressed/sends you a 1. On the one hand you will be able to detect if one push button has sent you a 1 with the maximum function, on the other hand you will be able to suppress flickering thanks to the defined time span (i.e. with a time span of half a second)


#### Available aggregation methods:
 
- arithmetic mean (average)
- geometric mean
- harmonic mean
- median
- minimum
- maximum


#### aggegration over multiple topics
The aggregator stores the retrieved values per topic for the pending time span. He assumes that every topic has the same mightiness, regardless of how many values he retrieved per topic.  Once the time span times out, this assumption leads to the following calculation of all retrieved values: 

1. Aggregation of all retrieved values per topic by the defined aggregation method
2. Aggregation of the aggregation results of each topic again by the defined aggregation method


#### topic and error handling

1. msg.topic is handled case insensitive (converted to LowerCase)
2. if the msg.payload doesn't contain a number, the aggregator node raises an exception which can be caught with the Catch node


### Installation
In your Node-RED directory, execute:

```sh
npm install node-red-contrib-aggregator
```


### Contributing
Please just raise a pull request on GitHub.


### Copyright and license
Copyright 2016, Roger Jaggi and Pascal Bohni under [the Apache 2.0 license](LICENSE).