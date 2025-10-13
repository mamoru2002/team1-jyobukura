FROM ruby:3.4.5

ENV RAILS_LOG_TO_STDOUT=true \
    BUNDLE_JOBS=4

RUN apt-get update -qq && apt-get install -y build-essential default-mysql-client curl

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN gem install bundler:2.4.22 && \
    bundle config set --local without 'development test' && \
    bundle install

COPY . .

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["/usr/bin/entrypoint.sh"]

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]