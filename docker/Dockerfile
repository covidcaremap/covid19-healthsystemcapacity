FROM osgeo/gdal:ubuntu-full-v2.5.0RC1
ARG PYTHON_VERSION=3.6

RUN apt-get update && apt-get install -y software-properties-common

ENV TZ=Europe/Minsk
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN add-apt-repository ppa:ubuntugis/ppa && \
     apt-get update && \
     apt-get install -y wget=1.* git=1:2.* python-protobuf \
     jq=1.5* \
     build-essential libsqlite3-dev zlib1g-dev=1:1.2.* libspatialindex-dev && \
     apt-get autoremove && apt-get autoclean && apt-get clean

RUN curl -o ~/miniconda.sh -O  https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh  && \
     chmod +x ~/miniconda.sh && \
     ~/miniconda.sh -b -p /opt/conda && \
     rm ~/miniconda.sh

ENV PATH /opt/conda/bin:$PATH
RUN conda install -y python=$PYTHON_VERSION
RUN conda install -y -c conda-forge awscli=1.16.* boto3=1.9.*
RUN conda clean -ya

# Install required libraries
#RUN apt-get install -y python3-rtree

COPY nbs/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
