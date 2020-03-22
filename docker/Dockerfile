FROM python:3

RUN apt-get update && apt-get install --no-install-recommends -y \
     libspatialindex-dev \
     unzip && \
     rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y nodejs npm

COPY nbs/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

WORKDIR /opt/src

ENV PYTHONPATH=/opt/src:$PYTHONPATH

ENTRYPOINT [ "jupyter" ]
CMD [ "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--notebook-dir=/opt/jupyter" ]
