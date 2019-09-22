import request from 'request-promise';
import cheerio from 'cheerio';
import MovieModel from './core/model';

export default async (queryString: string): Promise<any> => {
  const movieModel = new MovieModel();
  const encodedQueryString = encodeURIComponent(queryString);
  const searchPage = await request(
    `https://www.javbus.com/uncensored/search/${encodedQueryString}`
  );
  const infoPageUrl = cheerio
    .load(searchPage)('.movie-box')
    .attr('href');
  const $ = cheerio.load(await request(infoPageUrl));
  movieModel.setModel({
    title: $('h3')
      .text()
      .trim(),
    premiered: $('.info>p:nth-child(2)')
      .text()
      .split(': ')[1]
      .trim(),
    art: {
      poster: $('.bigImage')
        .attr('href')
        .trim(),
      fanart: $('.bigImage')
        .attr('href')
        .trim()
    },
    actor: $('.info>ul li img')
      .map((index, $actor) => ({
        name: $actor.attribs.title.trim(),
        thumb: $actor.attribs.src.trim()
      }))
      .toArray(),
    uniqueid: [
      {
        _attributes: { type: '1', default: true },
        _text: $('.info>p:nth-child(1)>span:nth-child(2)')
          .text()
          .trim()
      }
    ],
    genre: $('.info>p:nth-child(6) .genre>a')
      .map((index, $actor) => $actor.firstChild.data.trim())
      .toArray()
  });
  return movieModel;
};
