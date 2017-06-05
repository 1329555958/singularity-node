FROM centos:centos7
MAINTAINER "Yu Zhifu <yuzhifu@netfinworks.com>"
# Centos based container with Java8 and Tomcat8
RUN locale
RUN localedef -i zh_CN -c -f UTF-8 zh_CN.UTF-8
RUN echo "export LC_ALL=zh_CN.UTF-8" >> /etc/profile && source /etc/profile

ENV LANG zh_CN.UTF-8
ENV LC_CTYPE zh_CN.UTF-8

# Install prepare infrastructure
RUN yum -y update && \
        yum -y install wget && \
        yum -y install zip && \
        yum -y install unzip && \
        yum -y install git && \
        yum -y install lrzsz && \
        yum -y install rsync && \
        yum -y install tar

# Prepare environment
ENV JAVA_HOME /opt/jdk1.8.0_45
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/bin:$CATALINA_HOME/scripts
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Oracle Java8
#RUN wget --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" \
#       http://download.oracle.com/otn-pub/java/jdk/7u71-b14/jdk-7u71-linux-x64.tar.gz && \
#       tar -xvf jdk-7u71-linux-x64.tar.gz && \
#       rm jdk*.tar.gz && \
#       mv jdk* ${JAVA_HOME}
ADD jdk1.8.0_45 ${JAVA_HOME}

# Install Tomcat
#RUN wget http://apache-mirror.rbc.ru/pub/apache/tomcat/tomcat-8/v8.0.39/bin/apache-tomcat-8.0.39.tar.gz && \
#       tar -xvf apache-tomcat-8.0.39.tar.gz && \
#       rm apache-tomcat*.tar.gz && \
#       mv apache-tomcat* ${CATALINA_HOME}
ADD tomcat /opt/app/tomcat
RUN chmod +x /opt/app/tomcat/bin/*.sh

ADD dockerInit.sh /opt
RUN chmod +x /opt/dockerInit.sh
#ADD etcdctl /opt
# Create tomcat user
#RUN groupadd -r tomcat && \
#       useradd -g tomcat -d ${CATALINA_HOME} -s /sbin/nologin  -c "Tomcat user" tomcat && \
#       chown -R tomcat:tomcat ${CATALINA_HOME}

#RUN git clone git://git.vfinance.cn/docker_tools.git /opt/docker_tools

EXPOSE 8080
#EXPOSE 8009
CMD ["/bin/bash","/opt/dockerInit.sh"]
#CMD ["/opt/app/tomcat/bin/catalina.sh", "run"]