## Elasticsearch AWS Setup
SSH into the AWS Elasticbeanstalk linux machine with `eb ssh`. Then, run the following commands.
 - sudo yum install wget
 - sudo yum install java-1.8.0-openjdk
 - wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-x86_64.rpm
 - wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.1-x86_64.rpm.sha512
 - sudo rpm --install elasticsearch-7.12.1-x86_64.rpm
 - sudo systemctl start elasticsearch.service

After installing, verify that the elasticsearch cluster is running with `curl http://localhost:9200/`.


## Local Elasticsearch Setup
Follow [this link](https://www.elastic.co/downloads/elasticsearch) to download and run the Elasticsearch cluster. In order for the server to run correctly, the Elasticsearch cluster must be running. More specifically, the Elasticsearch batch file must be run prior to starting the server.