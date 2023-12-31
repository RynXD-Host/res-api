const axios = require("axios");
const cheerio = require("cheerio");
const EventSource = require("eventsource");

exports.you = async (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { data: html } = await axios.get("https://you.com/search", {
        params: {
          q: query,
          fromSearchBar: "true",
          tbm: "youchat",
        },
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          cookie:
            'uuid_guest=e4ec373e-5a86-489a-acf6-68f7443e83c4; safesearch_guest=Moderate; cf_clearance=8anOoxU0O8qpzFKs.N_IMi2iqzbG7tAE.enR5ho2BZs-1694762122-0-1-6ee73e73.49f8fd79.39e66193-0.2.1694762122; youpro_subscription=false; you_subscription=free; youchatMobileNudge_VisitCount=3; __cf_bm=kG2xPyBZgL87AKXGuMGlQ3R9hDH9h_zHWplMTHpiIsw-1696916949-0-AffNcwaPdv5EPgxlkL6Q9Cpw/X5NuNOwVIlVCWuLzI4PfvkpGbMW728kzaRl0t6Jkuf+5UZexY46U3P3DpFnZwLGooI+S2CryZK/PcMnYwW7; _cfuvid=UjrEU1Ra_gSnvnA0nEQbJzKgjt9MXQvWEuKU.GXXf20-1696916949975-0-604800000; g_state={"i_l":0}; stytch_session=j3T79rX8R5xuqI8bkK6EVWDBU1wg0hbFpPfLXIUCDHEo; ydc_stytch_session=j3T79rX8R5xuqI8bkK6EVWDBU1wg0hbFpPfLXIUCDHEo; safesearch_17a2441f7fcbf07468af3f69c189b097432d4cb3340120a7acdaf2427f667be7=Moderate; stytch_session_jwt=eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay1saXZlLTg3OWM4NzNlLTFkNTEtNDAxNS05ZDMwLTdlYWZmNTU4NzNjNCIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC1saXZlLTlkZWE3ZGI1LTJlMTUtNGE3ZC1iYjFmLTJjYjg0ODBlYTliMCJdLCJhdXRoMF9pZCI6bnVsbCwiZXhwIjoxNjk2OTE3MjkzLCJodHRwczovL3N0eXRjaC5jb20vc2Vzc2lvbiI6eyJpZCI6InNlc3Npb24tbGl2ZS0yYzQzYWI4Zi0yZjAyLTRlMjktOWI2Yi1mYTFhZjdhZjA0Y2UiLCJzdGFydGVkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo0NFoiLCJsYXN0X2FjY2Vzc2VkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo1M1oiLCJleHBpcmVzX2F0IjoiMjAyNC0wMS0wOFQwNTo0OTo0NFoiLCJhdHRyaWJ1dGVzIjp7InVzZXJfYWdlbnQiOiIiLCJpcF9hZGRyZXNzIjoiIn0sImF1dGhlbnRpY2F0aW9uX2ZhY3RvcnMiOlt7InR5cGUiOiJvYXV0aCIsImRlbGl2ZXJ5X21ldGhvZCI6Im9hdXRoX2dvb2dsZSIsImxhc3RfYXV0aGVudGljYXRlZF9hdCI6IjIwMjMtMTAtMTBUMDU6NDk6NDRaIiwiZ29vZ2xlX29hdXRoX2ZhY3RvciI6eyJpZCI6Im9hdXRoLXVzZXItbGl2ZS1lMzYyY2FiNi04MDZjLTRhZmMtOTI0MC0yYmQxMDA5M2Y4ODIiLCJwcm92aWRlcl9zdWJqZWN0IjoiMTAzMDMxMDI4OTA1NDU4ODY5NzgyIn19XX0sImlhdCI6MTY5NjkxNjk5MywiaXNzIjoic3R5dGNoLmNvbS9wcm9qZWN0LWxpdmUtOWRlYTdkYjUtMmUxNS00YTdkLWJiMWYtMmNiODQ4MGVhOWIwIiwibmJmIjoxNjk2OTE2OTkzLCJzdWIiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0IiwidXNlciI6eyJlbWFpbCI6ImFwaS5lbmRwb2ludGV4cGVydEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmFtaWx5X25hbWUiOiJlbmRwb2ludGV4cGVydCIsImdpdmVuX25hbWUiOiJhcGkiLCJuYW1lIjoiYXBpLmVuZHBvaW50ZXhwZXJ0QGdtYWlsLmNvbSIsIm5pY2tuYW1lIjoiYXBpLmVuZHBvaW50ZXhwZXJ0IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xqTHJrWERWdDVVVTl6RkFfNHpXUnpWUUIwcDV0ckNqa2xMN2V3Q0x0a2hnPXM5Ni1jIiwic3R5dGNoX3VzZXJfaWQiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0Iiwic3ViIjoidXNlci1saXZlLWY0MDQ0ZjAxLWNkNTYtNGE3Mi1hOTIyLTJlNDEwYWEyMTMxNCJ9fQ.sA9jZl9uJ2-fZ6dHos7ngXCAb2FZV41iG7Wd66JJq5MmegsXB15zgE8rNosWlQ9VTZaUMiaATncY9P8_EMWrRCTapAFAvhXiF5pECpnUd48QyoIGx7gUelNXs0w_FqyKVmfa0938nvI9I2So2JZwUgCUyZ-qtNUK7Xxo28VJ1eKxyBJHj18iPcoOB96QD68dFzs2fAn95dU6s71eOwDcbAnZRx-6a45EBz6cfPM8AZ9-Ap3ul8SximRgcU-383NxoKWazaOXYl-eT7eHQDirOXo7HPHuCXMO6uyp5-ajadUpwDzZtRc67aIFszatcFHlIGrU_jRc33wdgayXPxENDA; ydc_stytch_session_jwt=eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay1saXZlLTg3OWM4NzNlLTFkNTEtNDAxNS05ZDMwLTdlYWZmNTU4NzNjNCIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC1saXZlLTlkZWE3ZGI1LTJlMTUtNGE3ZC1iYjFmLTJjYjg0ODBlYTliMCJdLCJhdXRoMF9pZCI6bnVsbCwiZXhwIjoxNjk2OTE3MjkzLCJodHRwczovL3N0eXRjaC5jb20vc2Vzc2lvbiI6eyJpZCI6InNlc3Npb24tbGl2ZS0yYzQzYWI4Zi0yZjAyLTRlMjktOWI2Yi1mYTFhZjdhZjA0Y2UiLCJzdGFydGVkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo0NFoiLCJsYXN0X2FjY2Vzc2VkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo1M1oiLCJleHBpcmVzX2F0IjoiMjAyNC0wMS0wOFQwNTo0OTo0NFoiLCJhdHRyaWJ1dGVzIjp7InVzZXJfYWdlbnQiOiIiLCJpcF9hZGRyZXNzIjoiIn0sImF1dGhlbnRpY2F0aW9uX2ZhY3RvcnMiOlt7InR5cGUiOiJvYXV0aCIsImRlbGl2ZXJ5X21ldGhvZCI6Im9hdXRoX2dvb2dsZSIsImxhc3RfYXV0aGVudGljYXRlZF9hdCI6IjIwMjMtMTAtMTBUMDU6NDk6NDRaIiwiZ29vZ2xlX29hdXRoX2ZhY3RvciI6eyJpZCI6Im9hdXRoLXVzZXItbGl2ZS1lMzYyY2FiNi04MDZjLTRhZmMtOTI0MC0yYmQxMDA5M2Y4ODIiLCJwcm92aWRlcl9zdWJqZWN0IjoiMTAzMDMxMDI4OTA1NDU4ODY5NzgyIn19XX0sImlhdCI6MTY5NjkxNjk5MywiaXNzIjoic3R5dGNoLmNvbS9wcm9qZWN0LWxpdmUtOWRlYTdkYjUtMmUxNS00YTdkLWJiMWYtMmNiODQ4MGVhOWIwIiwibmJmIjoxNjk2OTE2OTkzLCJzdWIiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0IiwidXNlciI6eyJlbWFpbCI6ImFwaS5lbmRwb2ludGV4cGVydEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmFtaWx5X25hbWUiOiJlbmRwb2ludGV4cGVydCIsImdpdmVuX25hbWUiOiJhcGkiLCJuYW1lIjoiYXBpLmVuZHBvaW50ZXhwZXJ0QGdtYWlsLmNvbSIsIm5pY2tuYW1lIjoiYXBpLmVuZHBvaW50ZXhwZXJ0IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xqTHJrWERWdDVVVTl6RkFfNHpXUnpWUUIwcDV0ckNqa2xMN2V3Q0x0a2hnPXM5Ni1jIiwic3R5dGNoX3VzZXJfaWQiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0Iiwic3ViIjoidXNlci1saXZlLWY0MDQ0ZjAxLWNkNTYtNGE3Mi1hOTIyLTJlNDEwYWEyMTMxNCJ9fQ.sA9jZl9uJ2-fZ6dHos7ngXCAb2FZV41iG7Wd66JJq5MmegsXB15zgE8rNosWlQ9VTZaUMiaATncY9P8_EMWrRCTapAFAvhXiF5pECpnUd48QyoIGx7gUelNXs0w_FqyKVmfa0938nvI9I2So2JZwUgCUyZ-qtNUK7Xxo28VJ1eKxyBJHj18iPcoOB96QD68dFzs2fAn95dU6s71eOwDcbAnZRx-6a45EBz6cfPM8AZ9-Ap3ul8SximRgcU-383NxoKWazaOXYl-eT7eHQDirOXo7HPHuCXMO6uyp5-ajadUpwDzZtRc67aIFszatcFHlIGrU_jRc33wdgayXPxENDA',
          Referer: "https://you.com/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
      });
      let $ = cheerio.load(html);
      let props = JSON.parse($("#__NEXT_DATA__").text().trim());
      let response = await axios.get("https://you.com/api/streamingSearch", {
        params: {
          q: query,
          page: "1",
          count: "10",
          safeSearch: props?.props?.pageProps?.safeSearchSetting,
          onShoppingPage: "false",
          includelinks: "false",
          detailed: "false",
          mkt: "en-ID",
          responseFilter:
            "WebPages,Translations,TimeZone,Computation,RelatedSearches",
          domain: "youchat",
          queryTraceId: props?.props?.pageProps?.initialTraceId,
          chat: [],
          chatId: props?.props?.pageProps?.initialTraceId,
        },
        headers: {
          Accept: "text/event-stream",
          Cookie:
            'uuid_guest=e4ec373e-5a86-489a-acf6-68f7443e83c4; safesearch_guest=Moderate; cf_clearance=8anOoxU0O8qpzFKs.N_IMi2iqzbG7tAE.enR5ho2BZs-1694762122-0-1-6ee73e73.49f8fd79.39e66193-0.2.1694762122; youpro_subscription=false; you_subscription=free; youchatMobileNudge_VisitCount=3; __cf_bm=kG2xPyBZgL87AKXGuMGlQ3R9hDH9h_zHWplMTHpiIsw-1696916949-0-AffNcwaPdv5EPgxlkL6Q9Cpw/X5NuNOwVIlVCWuLzI4PfvkpGbMW728kzaRl0t6Jkuf+5UZexY46U3P3DpFnZwLGooI+S2CryZK/PcMnYwW7; _cfuvid=UjrEU1Ra_gSnvnA0nEQbJzKgjt9MXQvWEuKU.GXXf20-1696916949975-0-604800000; g_state={"i_l":0}; stytch_session=j3T79rX8R5xuqI8bkK6EVWDBU1wg0hbFpPfLXIUCDHEo; ydc_stytch_session=j3T79rX8R5xuqI8bkK6EVWDBU1wg0hbFpPfLXIUCDHEo; ydc_stytch_session_jwt=eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay1saXZlLTg3OWM4NzNlLTFkNTEtNDAxNS05ZDMwLTdlYWZmNTU4NzNjNCIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC1saXZlLTlkZWE3ZGI1LTJlMTUtNGE3ZC1iYjFmLTJjYjg0ODBlYTliMCJdLCJhdXRoMF9pZCI6bnVsbCwiZXhwIjoxNjk2OTE3Mjg0LCJodHRwczovL3N0eXRjaC5jb20vc2Vzc2lvbiI6eyJpZCI6InNlc3Npb24tbGl2ZS0yYzQzYWI4Zi0yZjAyLTRlMjktOWI2Yi1mYTFhZjdhZjA0Y2UiLCJzdGFydGVkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo0NFoiLCJsYXN0X2FjY2Vzc2VkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo0NFoiLCJleHBpcmVzX2F0IjoiMjAyNC0wMS0wOFQwNTo0OTo0NFoiLCJhdHRyaWJ1dGVzIjp7InVzZXJfYWdlbnQiOiIiLCJpcF9hZGRyZXNzIjoiIn0sImF1dGhlbnRpY2F0aW9uX2ZhY3RvcnMiOlt7InR5cGUiOiJvYXV0aCIsImRlbGl2ZXJ5X21ldGhvZCI6Im9hdXRoX2dvb2dsZSIsImxhc3RfYXV0aGVudGljYXRlZF9hdCI6IjIwMjMtMTAtMTBUMDU6NDk6NDRaIiwiZ29vZ2xlX29hdXRoX2ZhY3RvciI6eyJpZCI6Im9hdXRoLXVzZXItbGl2ZS1lMzYyY2FiNi04MDZjLTRhZmMtOTI0MC0yYmQxMDA5M2Y4ODIiLCJwcm92aWRlcl9zdWJqZWN0IjoiMTAzMDMxMDI4OTA1NDU4ODY5NzgyIn19XX0sImlhdCI6MTY5NjkxNjk4NCwiaXNzIjoic3R5dGNoLmNvbS9wcm9qZWN0LWxpdmUtOWRlYTdkYjUtMmUxNS00YTdkLWJiMWYtMmNiODQ4MGVhOWIwIiwibmJmIjoxNjk2OTE2OTg0LCJzdWIiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0In0.E2NJ81wH5CzAbyZ0vRbDP5DErdq0h93pIbb5ClMSXo-zSpMIb3X8S-71U6_DqdAxv6qSN-IirglSvJmmRmZHH758VZ9-HeIjML3togtj5JCzmiA0qatSFtL483hnIJCV88BUlSTrxheTihPs68gJd_jcbr-YGAiuMwyOiHhg5OQvW6Os51-Cs5Ws3ArJDh8y-ZAt0HeBW_aiq-AfJbWNdwofuOrw3aXCKt6XKtmxUlW0EpRcbO3BNvIXrHE9jfyIKpexMd1Qtx49kFR01NvPvEeO_xadl52ZfjxG3O2rfJtEsxsRPaR2my6ldT9QopyyDeyJ3futGcGMYWPzGxk2Lw; safesearch_17a2441f7fcbf07468af3f69c189b097432d4cb3340120a7acdaf2427f667be7=Moderate; stytch_session_jwt=eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay1saXZlLTg3OWM4NzNlLTFkNTEtNDAxNS05ZDMwLTdlYWZmNTU4NzNjNCIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC1saXZlLTlkZWE3ZGI1LTJlMTUtNGE3ZC1iYjFmLTJjYjg0ODBlYTliMCJdLCJhdXRoMF9pZCI6bnVsbCwiZXhwIjoxNjk2OTE3MjkzLCJodHRwczovL3N0eXRjaC5jb20vc2Vzc2lvbiI6eyJpZCI6InNlc3Npb24tbGl2ZS0yYzQzYWI4Zi0yZjAyLTRlMjktOWI2Yi1mYTFhZjdhZjA0Y2UiLCJzdGFydGVkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo0NFoiLCJsYXN0X2FjY2Vzc2VkX2F0IjoiMjAyMy0xMC0xMFQwNTo0OTo1M1oiLCJleHBpcmVzX2F0IjoiMjAyNC0wMS0wOFQwNTo0OTo0NFoiLCJhdHRyaWJ1dGVzIjp7InVzZXJfYWdlbnQiOiIiLCJpcF9hZGRyZXNzIjoiIn0sImF1dGhlbnRpY2F0aW9uX2ZhY3RvcnMiOlt7InR5cGUiOiJvYXV0aCIsImRlbGl2ZXJ5X21ldGhvZCI6Im9hdXRoX2dvb2dsZSIsImxhc3RfYXV0aGVudGljYXRlZF9hdCI6IjIwMjMtMTAtMTBUMDU6NDk6NDRaIiwiZ29vZ2xlX29hdXRoX2ZhY3RvciI6eyJpZCI6Im9hdXRoLXVzZXItbGl2ZS1lMzYyY2FiNi04MDZjLTRhZmMtOTI0MC0yYmQxMDA5M2Y4ODIiLCJwcm92aWRlcl9zdWJqZWN0IjoiMTAzMDMxMDI4OTA1NDU4ODY5NzgyIn19XX0sImlhdCI6MTY5NjkxNjk5MywiaXNzIjoic3R5dGNoLmNvbS9wcm9qZWN0LWxpdmUtOWRlYTdkYjUtMmUxNS00YTdkLWJiMWYtMmNiODQ4MGVhOWIwIiwibmJmIjoxNjk2OTE2OTkzLCJzdWIiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0IiwidXNlciI6eyJlbWFpbCI6ImFwaS5lbmRwb2ludGV4cGVydEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmFtaWx5X25hbWUiOiJlbmRwb2ludGV4cGVydCIsImdpdmVuX25hbWUiOiJhcGkiLCJuYW1lIjoiYXBpLmVuZHBvaW50ZXhwZXJ0QGdtYWlsLmNvbSIsIm5pY2tuYW1lIjoiYXBpLmVuZHBvaW50ZXhwZXJ0IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xqTHJrWERWdDVVVTl6RkFfNHpXUnpWUUIwcDV0ckNqa2xMN2V3Q0x0a2hnPXM5Ni1jIiwic3R5dGNoX3VzZXJfaWQiOiJ1c2VyLWxpdmUtZjQwNDRmMDEtY2Q1Ni00YTcyLWE5MjItMmU0MTBhYTIxMzE0Iiwic3ViIjoidXNlci1saXZlLWY0MDQ0ZjAxLWNkNTYtNGE3Mi1hOTIyLTJlNDEwYWEyMTMxNCJ9fQ.sA9jZl9uJ2-fZ6dHos7ngXCAb2FZV41iG7Wd66JJq5MmegsXB15zgE8rNosWlQ9VTZaUMiaATncY9P8_EMWrRCTapAFAvhXiF5pECpnUd48QyoIGx7gUelNXs0w_FqyKVmfa0938nvI9I2So2JZwUgCUyZ-qtNUK7Xxo28VJ1eKxyBJHj18iPcoOB96QD68dFzs2fAn95dU6s71eOwDcbAnZRx-6a45EBz6cfPM8AZ9-Ap3ul8SximRgcU-383NxoKWazaOXYl-eT7eHQDirOXo7HPHuCXMO6uyp5-ajadUpwDzZtRc67aIFszatcFHlIGrU_jRc33wdgayXPxENDA',
          Referer: "https://you.com" + props?.props?.pageProps?.pageUrl,
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
      });

      let textResult = "";

      const streamData = response.data.split("\n");
      for (let i = 0; i < streamData.length; i++) {
        const line = streamData[i].trim();

        if (line.startsWith("data: {")) {
          const jsonData = line.substring(line.indexOf("{")).trim();

          const eventData = JSON.parse(jsonData);
          console.log(eventData);
          if (eventData.youChatToken) {
            textResult += `${eventData.youChatToken}`;
          }
        }
      }

      resolve(textResult);
    } catch (e) {
      reject(e);
    }
  });
};

function YouURLSearchParams(urls, params = {}) {
  let url = new URL(urls);
  for (let param in params) {
    url.searchParams.append(param, params[param]);
  }
  return url.href;
}
