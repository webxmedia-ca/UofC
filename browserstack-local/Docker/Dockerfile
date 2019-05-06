FROM ubuntu:latest

COPY ./bin/BrowserStackLocal /
COPY *.sh /
RUN chmod +x /*.sh; \
    chmod +x /BrowserStackLocal

CMD ["./script_wrapper.sh"]
