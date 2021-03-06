/*
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * We need to load sparkSession.js and SparkConf.js in order to create sparkSession
 * The sparkSession will load the rest of sparkJS files. So these are the oly two
 * the user has to explicitly load.
 */
var SparkSession = require(EclairJS_Globals.NAMESPACE + '/sql/sparkSession');
var sparkSession = SparkSession.builder()
          .appName("core examples unit test")
          .getOrCreate();


var WordCount = function() {
    load("examples/word_count.js");
    return run(sparkSession);

}

var SparkTC = function() {
    load("examples/spark_tc.js");
    var result = run(sparkSession);
    if (result > 0) {
        return "all is good";
    } else {
        return "example failed";
    }

}

var SparkPI = function() {
    load("examples/spark_pi.js");
    var result = run(sparkSession);
    if (result > 3.1) {
        return "all is good";
    } else {
        return "example failed";
    }

}

var SparkLR = function() {
    load("examples/spark_lr.js");
    var result = run(sparkSession);
    if (result) {
        return "all is good";
    } else {
        return "example failed";
    }

}

var PageRank = function() {
    load("examples/page_rank.js");
    return run(sparkSession);

}

var LogQuery = function() {
    load("examples/logQuery.js");
    var x = run(sparkSession)
    return JSON.stringify(x);

}
