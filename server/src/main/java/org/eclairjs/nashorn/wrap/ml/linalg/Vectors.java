package org.eclairjs.nashorn.wrap.ml.linalg;
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

import org.eclairjs.nashorn.Utils;
import org.eclairjs.nashorn.wrap.WrappedClass;
import org.eclairjs.nashorn.wrap.WrappedFunction;


public class Vectors extends WrappedClass {

    static WrappedFunction F_dense = new WrappedFunction() {
        @Override
        public Object call(Object thiz, Object... args) {
            double[] values = (double[]) args[0];
            return Vectors.dense(values);
        }
    };

    static WrappedFunction F_sparse = new WrappedFunction() {
        @Override
        public Object call(Object thiz, Object... args) {
            int size = (int) args[0];
            int[] indices = (int[]) args[1];
            double[] values = (double[]) args[2];
            return Vectors.sparse(size, indices, values);
         }
    };

    static WrappedFunction F_zeros = new WrappedFunction() {
        @Override
        public Object call(Object thiz, Object... args) {
            Object returnValue;
            int size = (int) args[0];
            returnValue = org.apache.spark.ml.linalg.Vectors.zeros(size);
            return Utils.javaToJs(returnValue);
        }
    };

    static WrappedFunction F_norm = new WrappedFunction() {
        @Override
        public Object call(Object thiz, Object... args) {
            Object returnValue;
            org.apache.spark.ml.linalg.Vector vector = (org.apache.spark.ml.linalg.Vector) Utils.jsToJava(args[0]);
            double p = (double) args[1];
            returnValue = org.apache.spark.ml.linalg.Vectors.norm(vector,p);
            return returnValue;
        }
    };

    static WrappedFunction F_sqdist = new WrappedFunction() {
        @Override
        public Object call(Object thiz, Object... args) {
            Object returnValue;
            org.apache.spark.ml.linalg.Vector v1 = (org.apache.spark.ml.linalg.Vector) Utils.jsToJava(args[0]);
            org.apache.spark.ml.linalg.Vector v2 = (org.apache.spark.ml.linalg.Vector) Utils.jsToJava(args[1]);
            returnValue = org.apache.spark.ml.linalg.Vectors.sqdist(v1,v2);
            return returnValue;
        }
    };

    public static Object dense(double... values) {
        return Utils.javaToJs(org.apache.spark.ml.linalg.Vectors.dense(values));
    }

    public static Object sparse(int size, int[] indices, double[] values) {
        return Utils.javaToJs(org.apache.spark.ml.linalg.Vectors.sparse(size, indices, values));
    }


    private org.apache.spark.ml.linalg.Vectors _vectors;

    public Vectors(org.apache.spark.ml.linalg.Vectors _vectors)
    { this._vectors = _vectors; }

    static public String getModuleName() {
        return "ml.linalg.Vectors";
    }

    public boolean checkInstance(Object other) {
        return other instanceof Vectors;
    }

    public Object getJavaObject() {
        return _vectors;
    }

  /*  @Override
    public String toString() {

        return _vectors.toString();
    }
*/
    public String getClassName() {
        return "Vectors";
    }


    // get the value of that named property
    @Override
    public Object getMember(String name) {
        switch (name) {
            case "dense":
                return F_dense;
            case "sparse":
                return F_sparse;
            case "zeros":
                return F_zeros;
            case "norm":
                return F_norm;
            case "sqdist":
                return F_sqdist;
        }
        return super.getMember(name);
    }

    @Override
    public boolean hasMember(String name) {
        switch (name) {
            case "dense":
            case "sparse":
            case "zeros":
            case "norm":
            case "sqdist":
                return true;
        }
        return super.hasMember(name);
    }


}
