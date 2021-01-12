var simpleStatistics = require("simple-statistics");

module.exports = function (RED) {
    function AggregatorNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        node.intervalCount = config["interval-count"];
        node.intervalUnits = config["interval-units"];
        node.absoluteStartupTime = new Date();
        node.absoluteStartupTime.setMinutes(node.absoluteStartupTime.getMinutes() - node.absoluteStartupTime.getTimezoneOffset());
        node.correctedStartupTime = node.absoluteStartupTime.getTime();

        node.factor = 1;

        switch (config.intervalUnits) {
        case "s":
            node.factor = 1000;
            break;
        case "m":
            node.factor = 1000 * 60;
            break;
        case "h":
            node.factor = 1000 * 60 * 60;
            break;
        case "d":
            node.factor = 1000 * 60 * 60 * 24;
            break;
        }

        node.intervalTimeout = node.factor * config.intervalCount;
        node.startupTimeout = node.intervalTimeout - (node.absoluteStartupTime % node.intervalTimeout);
        node.values = {};

        node.aggregate = function (list) {
            var output;

            switch (config.aggregationType) {
            case "mean":
                output = simpleStatistics.mean(list);
                break;

            case "geometricMean":
                output = simpleStatistics.geometricMean(list);
                break;

            case "harmonicMean":
                output = simpleStatistics.harmonicMean(list);
                break;

            case "median":
                output = simpleStatistics.median(list);
                break;

            case "min":
                output = simpleStatistics.min(list);
                break;

            case "max":
                output = simpleStatistics.max(list);
                break;

            case "sum":
                output = simpleStatistics.sumSimple(list);
                break;
            }

            return output;
        };

        node.aggregateAll = function () {
            if (config.submitPerTopic) {
                for (var topic in node.values) {
                    if (node.values.hasOwnProperty(topic) && node.values[topic].length > 0) {
                        node.send({
                            topic: topic,
                            payload: node.aggregate(node.values[topic])
                        });
                    }
                }
            } else {
                var results = [];

                for (var topic in node.values) {
                    if (node.values.hasOwnProperty(topic) && node.values[topic].length > 0) {
                        results.push(node.aggregate(node.values[topic]));
                    }
                }

                if (results.length > 0) {
                    node.send({
                        topic: config.topic,
                        payload: node.aggregate(results)
                    });
                }
            }

            node.values = {};
        };

        node.primaryTimeout = setTimeout(function () {
            node.interval = setInterval(node.aggregateAll, node.intervalTimeout);

            if (config.submitIncompleteInterval) {
                node.aggregateAll(); // aggregates and clears data 
            } else {
                node.values = {}; // throw away data 
            }

        }, node.startupTimeout);

        this.on("input", function (msg) {
            try {
                if (msg.payload !== null && msg.payload !== "") {
                    var lowerTopic = "";
                    var topic = msg.topic;
                    if (topic) {
                        lowerTopic = topic.toString().toLowerCase();
                    }

                    if (!node.values[lowerTopic]) {
                        node.values[lowerTopic] = [];
                    }

                    node.values[lowerTopic].push(parseFloat(msg.payload, 10));
                }
            } catch (err) {
                node.error(err.message);
            }
        });

        this.on("close", function () {
            clearTimeout(node.primaryTimeout);
            clearInterval(node.interval);
        });
    }

    RED.nodes.registerType("aggregator", AggregatorNode);
};
