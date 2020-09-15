FROM python:3.8.2-buster

ADD src/ /opt/api/src
ADD requirements.txt /opt/api
ADD create_tables.py /opt/api
WORKDIR /opt/api

RUN pip install -r requirements.txt

CMD ["gunicorn", "-b", "0.0.0.0:5000", "src.app:app", "--preload", "--log-file", "-"]
