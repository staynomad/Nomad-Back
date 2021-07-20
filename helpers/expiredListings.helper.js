const { sendEmail } = require("./nodemailer.helper");
const { baseURL } = require("../config/index");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");

const findExpiringListings = async function () {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const week = 7;
    const convertMilli = 1000;
    const convertSecMin = 60;
    const convertHour = 24;

    const listings = await Listing.find({});
    for (const listing of listings) {
      // Calculations
      const listDate = new Date(listing.available[1]);
      const diffTime = today - listDate;
      const daysPastExpiration = Math.round(
        diffTime / (convertHour * convertSecMin * convertSecMin * convertMilli)
      );

      // Sending reminder a week before a listing's expiration
      if (
        listing.userId !== undefined &&
        listing.reminder != true &&
        0 >= daysPastExpiration &&
        daysPastExpiration >= -7
      ) {
        // Find the associated user.
        const user = User.findOne(listing.userId);
        const email = user.email;

        // Send the reminder.
        sendReminder(email, listing.title);

        // Mark reminder as sent.
        listing.reminder = true;
        listing.save();
      }

      // Separate check to update listing status to inactive the day after expiration date
      if ((listing.active = true && daysPastExpiration > 0)) {
        // mark listing as inactive
        listing.active = false;
        listing.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const sendReminder = async (email, listingName) => {
  const userMailOptions = {
    from: '"NomΛd" <reservations@visitnomad.com>',
    to: email,
    subject: `Your Listing is Expiring Soon!`,
    text: `Please check your account, as your listing for ${listingName} expires next week.`,
    html: `<div>
             <div style=
                 "align-items:center;
                 background-color: #c8c8c8;
                 border-radius: 10px;
                 display: flex;
                 flex-flow: column nowrap;
                 font-family:'Open Sans',sans-serif;
                 justify-content:center;
                 margin: auto;
                 padding: 2rem;
                 text-align: center;
                 width: 40%;"
             >
                 <img src=
                     "data:image/png;base64,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
                     1F7Ego6OnHzmBUUfCYjsdd4w+Hc/FbHpurbNKViqYDjvJ+PlgC8q15GO9PbiRNKTfdFO5e33WRRfZOOIfBMLXCdw57ze6nKdf7w1YsdOQcEOXjiDplF6U6UjYJz/qk9mXWt1pmrgb6amV/YS9+ru0cs77EWq9TqTn6HJl8NNOD88x9RhFutpVr9dai3tYxPBlKghfTzDdVCbzzzHtYMuSc7P75K1zkQ9dj9MRoft9DW4I07q1OPtm9Cse58t6R3VaAkYczJ1PT0h62EjhfZRpLe6nf9Pntj7C6RC+nuL+lWbZbi7zjpAOOio0+v1u+fpaizvlG0c6raJ1a7MvtchRjM+4uIx+Mep1Mh3ZGE/j9OBSbzT6Y+FkOmOkPSd1deRhMaNgz0L4egoNAze/3ckHKU12a0rky78+L2Ot/vqURc39vka5/8Pz8StO97itOALo/ZRJ6x1VslTFqNdJVnu00D59T0ij3bWxfjjJFro68ou/uujuDIEn46P+DNslBdR/pYE2r/z0L84F0jk8SnQBwcf/7YJsN8VzRHX4bK3sl0Y3XI6ywvGJxnvrvVfpoSMnGxTex8JGosC9vse93MIE4esUNMkvXWEqIgi6pPzhK23yxesdgS5XjxLtU/b598/Kls+dCcJMR0bmrzR4R9Gy0V5pvF1OXOnDgo3VnxTex4de5z77fres9EXzepBuhK9TunOtWbYbqf8ykpMjQ9/rkQdcYN3g+cV3u2S9M35P+sM9dZEc/Rp5rtl7hePm01Rof5wudNqryI4WLdlAe4PdfKlV5p/n3DouNns7PmpP755auo/dSku5NA0tSc5BePa60oaeUdnbUTedHe2o8o7syN87kIqNPale2ZaG+Q1pfLgmLeOr0jC3Jk3Tj6TKeb9yc1eKdg8k7/BQDpxQFNTekM9y6ITRWedzW7W1525qa0u6zxX9+ZU6X2UR2qh+wzmHhtL8hB7VvR215+GdV9vdz6sNZc71NeGcp1Fkcm7lHx1Ji/N962bXQX3lOHeukh29th3JQYFuhZ+Z+pn5xjKpcv4exQub3jvIuXHjRix2zZz8doe711+6nXFu2Gf/fcg7yjzdc0u3fvCj2LnpX//Jbe8ovbSVhK5otKF2eUsaJ1elYmJVilI92Z0bzHZjQlbaKmXK+bJVk/bib0ekbGzFO0ovG+dK/sGhXP/pHcnf2vfeCTfdvirduyg0za3L+V8MeEfRsXylQW493+odpV/x9p68/L9vS86h90aEmJxbxdv7cv3HX3tH6aErVvdLCuSgtEA26xMy11opC87n3sZK81wnaTz//qiUjS5772Q3Rr5S9Ki8SCqdG0vJ3Ib3TmZFYeRL98i76TMgnlar88R41vlezn40KU13ZiUxsy75m3veP01N/vqulE2vScu9eWlxLhQ1m7tyUORcrJyLVrrMO7/DpqlHkmchrNg4V9zRr7zcSIx+aVHwwKX013RGcuTLuSnffb1Ddgvt7fixn58ndcvbUri67b0THUYjX3o9vpPe67HO2uQ5Ia9gbVdKZ9elfmBR2vrnpc75WZccHcl6aaEcpqkW98j5LM23V0rDvHNtdq6x2Y6aLx9uv9DidnrGs+nP6dZrHd5R8Fpm1uSVn/dLzy8HpbJ/wQlcwZ7Uhas7Un17Ti69fV9e+o8RqXaO02E/P1dufa9bDovjs63VUG9tJLbpGrlGPcqTbDWXZ2RF8kNLNWZwQsDOgZQPLUnbb0fl1R/fkmufTLqzIumg7Wg+/7NuGuo6CF8+aBHh1290ZcW2MSb2Korky+92p6U3UMPCplz/5YD0vjuY+tSiT4nxFbn6b/fk+Q/HJbER/MVpw3nq7HcCWFw2GdZFBfOXw71KWEe9wrxpe6alq6P9s+jegdmyN2qY6FRv5f15efmnd+XqF1NStBP8SLyughx8vdMt8chmhC+ftI/J+OvpG9GJOg2md75/1u3uHiQNPS/9Zlgu/rxfih+ue+9adHQkFQOL8uL/vS1XP590a5uCNFeXkNkX7NXXpNvQubpQj36NsoXYE+mK1fE2nyUNB0duHaOJZVZFZ0yOc13TEf/rTgi7fPNhGq5zpbIc8gezdCN8GRhzLkzLl9LbeDCq5q82yWp5sEPLzbPr8sLb9yQxseq9kzk5ByLVd+blpXcGJBHwVOfAhQa3li8Owjz6tdVS7oZdnGy1t9od5fejfXJFysZXnIcl/9P0I2dr6HifYTl7B1J7c0Ze+sWDwEf7715ryuou+Hy0Dd19oTU2N8qg6HTB4MVgQ+n5e3Ny7t1Btz4hTHTK8/mf9UvjfHALMHTl0YPX2mNz4xnqrQtlLdsYfb2eLCdHRnr8n8N1A4van0c6hvwvMNDdRTba7LamwcmKFrfcB19dsRsUrf968EZn1gZswpch/QDdfrOT+q/HTH+r1f25BEGHu1/43Zg0fTrlTvmFka5QPP/OA+kdWPDeMaf7C8ZlWF4XE4Rt9Es3zJ+tZ9TrSbQWTksr/NARkhKvT1eV4erOGaYeQ0MffM+/Myjn789775jTHSVWL2RnB3zCVwB0NdDE6+3eUXbTHlmjAT2taoNUndYrHw7/8nwtVG35cEKufumExIDcu9IUm6LjQecmGqYN6hn1ejqT1YYdQ9+MeqmC9V1pmfE/WvKQwvtwcR6Amz6ZdFdEBqX/UoMcpam9RZgRvgKigWPlAvVfwy+d8V6Z0V7ML7w3am0lY1Cqv56TXp1yCYBbLxWTjZ7DNPql+xTONLBV2JPsJwplqsX/hshVg3/8+W86dpwKnYJf6a31jhAWuiLyQkA9InV6eTULf8eErwDdebFVdmrT3+g1rNa6awJbtn/lkykpidD2NI9r/njcXRwQBC06DtM+ibrDg1+D5+rdDtuZNm4w6pXY2nN3UIizZedG6LfjuX7udbTrcWXjy+4otl9jPc6NOcvbEoRR4+dTRteDxw1eacy60S/CV4C0n9W9N7vkqCD76r/0xOl/IZipnHP981IVYF2BbToF2fObYalcM2/IqrVzCyFaUXvm1oz3KnU6+rWQ4dEv3Rz/ocEG+T135iQv4GX3YaLFz2MGoxDNJ4z65uwfSZfBljIbbuG9v5YXSKMjke7fjgbSeFp/x9k2+kX4cuhTWVBPs9peYfK19G6lE0a6x6Q2CTWlT1LNnwRXN5UpubsHcunXQ0ZP/EnuasEQjBipwsUNaTMYkRw4n9nRrwmDvl6656DuopATznUfgdg8U+XeCP3Qz/qT9ietNS68Z+oxjLQVxcVfDUrBrnkz1sEsa9tE+HJoQ8Dz7424e2sFYbij2g0j2WSix3yjZr14d70/6hZ1xkGB80R4+Ytp78g/HTFaDlE9Yeuth96r
                     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
                     BG+AqSrgK7+btQ7Mne/r0E2zlR6R+GTWDa7GM+G+HtLl+2GhFHBs0r3TTBIOQciPbf9r3zUp+eVJ9Qp7ScKZNhgqqlrbEUKV1L/WUax1cRad43RzbAlzaNeSlebtsyYzR7MGdS0ITibTWXeK38qU6rBjCbCV8B0v7KLAa6c+vr1dtkvDecIUfHSpvfKH+3uH7XeZqZW2s0Cpzanzd2OxrRjUqVz4zbZw8+t/TphCy5d4Wgy6tWUJbVeatygEam2gdB2EDY0GRbeTzoPdBTeZ97qGbPWHyURGt33i/CVBg1fzkjjfDDbb2jPo8HvdLrTVWFT6IQvLVg2sd6RXaNfU21m32+1wdY9mZJzcCjn7hqsfCwpkNVjIxr6QDLc43+UQ/dnLVzyvwl4lOw0JGSpyn+hvbaB0HYQNpSNLxstKNEw/sjgc4FgTBtueF4Uwetcqghf6aDL7H87KkU7wdR/zdYnZO6FZu8oPLQgsmLN7CSZNdgEOWp2q4rduhQT1fPBLOqwrap/wagesv9Swx+Nfi1cbpB9gw7YzVk06rVgWGhv2gYiFXpN6TIcZRvu9b8AA+Z2a0pkw3C2pmTRbFYlCghfaaJ7xF35/bh3ZO7epUbZMnyaSIeaZbOTZL4uIYeGHd+jYt1wylFVPlzzXkWL3lSDGv3SjZSHDGq9dFeKooX4X9yV7o832um/b6A2ytU2EDbVGoY9Cu8za91wylFLK7JhVJrwlUaJyVW5cNd/sfFxt17vCF39V+W0WRg4zBF51J0FT6rO9zlpsK2L0ka+xbPBTGdnQlX/otFo8KA3+rWgtV4n1ICd1pmbD71X8ffobK3Rz0o3G7etaH5TqgynneYNR/vg30ybWZPwloBaNoUd4SvNGr6YkvqAhlC179HQmx3OjTw89V9l4ytuKDBx/0qjuzQ5zta6amS50n/djap3bkq2am/SQf/u5+75fxjZKCmQ+ecaZchgK5nWh2vuzT1bjBn8rLSes2LQTqH9ce2DC94rfybaK+WwODu3L8skHXHUbfJMVBG+EAS30eRvR9yh1CDMNJTJ/LUm7yjzdHulJsNpCV1UMH+10TuKnyPnHtD/fIt35F/jZDCbuGdS9b0Fo3Ph3uUmo5GctgBGvXKOotFrYruxTFYq/NcYNs+sueUTmVA+tGT0UKeF96s0XbVuOIDelImpVe9VvBG+LND+NVc/DK7+675zAwpTTUPDmPl+bwMX6t2+TXG0cqFRNgy/Nx2F0BtS1OnoV+/94KbiU6E7UBTNRXfaNlXzhptNN1no7fUk+Vv70jplVtIwxnZDVq13VBltX6XqlrayZscJwpclZU5AOdc/7x2Z0TqpW9/uCE0/m3LnezNtOaGjGQ9fMB8dChvtLH7vivmoXtNs5kYhglZ7dz4j+1O2Z1Gtl065jRsU2mttXmIiM1OOSQ2G9War5cWy3UzhvRU5OTJ8zfz63Toc/QfM0yJ8WdT02aTULgezikM7fw+/EY7+X7nbzlPqtPmU2HBXjezUmdULhM381SZ3r05TTQPxuSjl7h7IufvBPIicVtPchvVVe5mkU24mDWg7R5bd3QkyKTGxYtyuZ96guSxOT3dQWK40a6Oj08zlI4QvpIFezM6/NxLYU/90U7lbrB4GrQH1Tfr6O92xKZTVraEeXHz6xtCnUby95y5siJPau3Nu53Rb2m9lz6iXGjNc7VeTgVWOx2m9bKfhSMh4e5XbbgPps+eErlsvm9d6tU08crfoyxaEL8t0PvvqR5PekTntfxQGWksTRFd/rY3q/17PidvJRIk2VP3qjQ53itjUhS9n3C7xcaILNXoDmoZ/Ft0UWrf9yhY61bZa7n8UQutuwtJnqcawztEtvKf2K220rOLud88a71erZSstX0x7R9mB8JUBOrTam8Fi1nTpuBXM6NdcXalMvtbuHUWPPml//b1u4wuSql7dksoQjEKkQ90dO6NfnVlU66XmDAvtz4To86Yh0LRUY5zthtLDebAcebPTaEVt0tmhRSlcjf9+jo8jfGVI86cT7o01TkqmHknNSjDf03BXtSw+F56WGqd15JxRA9/tNt5GKKn3M+dpMCKtDVKltYJnB8z6OT2L9tjTz2WQckL869Du/2MG+6XmHxxKeciKns8YPqhqONhuKvOOEJTZF1tkssV81xX9zDV8lT3bfSURvjJEt1u58B+jVutebOj5bMp7Ze72c81/sqFymGnwmny90+3FFgRtCBp0cAib+tuz7sU3XYIajY2KR721cqhDEj61T666CyLCpGJkSfINH0DmI3QdiYLlS41yvy+YeuPee/OxWcmdCsJXBukw65VPg6v/CgOtrekOcMXKV9fb5OErbW6wCTPdn7L/rXPuiF0QtAaiPWafjZNoge3ZNE3B63RVYiI7Gja6dLl/b7134E9dCMshtD6wbdzs9zh+hsL7IGjD6KnXO+TWi8G0BdLVrPVf+9/zNcoIXxlW4Vzszsast0nrJ5PGS8Qf9+BcnTz483OhXQWpu/h/8dfnZbY+4b1jzq2BWMmOGoi623PGIxsn6cyyUS9tvGzSzDexsSclId24vd6wDm0/TzveZ8EesmmkU9r33zovg2eD+zlecIJXlLdMM0H4CoHWj8aNN5INE31SvaS1SgGaaUg4AeeC7NSadVAO2npntXz6w3OyEeCG5zoV3fhl9qz80SmH7oBHXLT2UBsbp4PpXqbpMmtYaN8xtCAh/dbcEfXE1p535M+44ahgNtP+i185119dDBWUxMaOVPZnZreLMCB8hYDWf13U/l8xaidQPrTo1iwFSQPOZ07QWXyuUY7yM9tcVncXmH61TT5/s1P284M9jXQrqmzqd6N06iHI0a+uW9k1laFbc020mRU/Vw2GeATe+Wy0G7adcAvvGym8T8W+c83V69wnf+k8YAbY1kjvdVfeG814I99MInyFhC6pvhxgsXoYdDuBsmw92BE93Ybo9nMt8snfXZKVC/XWa8GOCvJk/vlm+ehHl2TAsJHlSS7fnJbykcxu65IJ+Ru70hXQ3pU6ilw2ll0/w2XDQvuWmXV3D9owq3Ie6EyZ7neZLbQ+buZbrfLxjy661zmTz9ZJnvv9uBTNb3pH2YnwFSKV/QvSlaapkkzQ6ccrvx5Oyz5+ur3SzZfPyBd/2ydrXTVuz5l00pC30tcgH/9dn9y90hT4aJfqccJH7c3sLD5V9bdmApnS69Zar3ROn4VtgDonR8Z6zBqJZnIT7dMqXN0xbuQ83l7pNgbFyfYThTJ/rUk+dB5u+y82uA+7QdMHzLLR7HvAPI7wFTJtH4wHPlqUSVo0fu13Y95R8LSf1hdvdMhXf3tR5l5skZ2GRGBBTAOXdgufcU
                     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
                     RvgAAACwifAEAAFhE+AIAALCI8AUAAGAR4QsAAMAiwhcAAIBFhC8AAACLCF8AAAAWEb4AAAAsInwBAABYRPgCAACwiPAFAABgEeELAADAIsIXAACARYQvAAAAiwhfAAAAFhG+AAAALCJ8AQAAWET4AgAAsIjwBQAAYBHhCwAAwBqR/w/u8Ydk+xCbrwAAAABJRU5ErkJggg=="
                     style="width:10%;" 
                 />
                 <div style=
                     "font-size:14px;
                     padding: 10px;"
                 >
                     Dear {{ $name }},
                 </div>
                 <div style=
                     "color: #02b188;
                     font-size:22px;
                     font-weight: bold;
                     padding: 10px;"
                 >
                     YOUR LISTING IS EXPIRING SOON!
                 </div>
                 <div style=
                     "color:white;
                     font-size:30px;
                     font-weight:bold;
                     padding: 10px;"
                 >
                     Update your listing now!
                 </div>
                 <div style=
                     "padding: 10px;"
                 >
                     Please check your account, as your listing for <b>${listingName}</b> expires next week.
                 </div>
                 <button 
                     href="www.google.com" 
                     style=
                     "background-color:#02b188;
                     border:none;
                     border-radius:0.5rem;
                     box-shadow:0rem 0.2rem 0rem 0rem #0cc99d;
                     color: white;
                     display: block;
                     margin: auto;
                     padding: 15px 25px;"
                 >
                 <a 
                     href="${baseURL}/myAccount"
                     style=
                     "color: white;
                     text-decoration:none;
                     text-align:center;"
                 >
                     Take me There!
                 </a>
                 </button>
             </div>
             <div style=
                 "align-items:center;
                 background-color: #02b188;
                 border-radius: 0px 0px 10px 10px;
                 display: flex;
                 flex-flow: column nowrap;
                 font-family:'Open Sans',sans-serif;
                 justify-content:center;
                 margin: auto;
                 padding: 2rem;
                 text-align: center;
                 width: 40%;"
             >
             <div style=
                 "color: white;
                 font-family: 'Open Sans', sans-serif;"
             >
                 Visit us at 
                 <a style=
                 "color: white;
                 font-family: 'Open Sans', sans-serif;
                 text-decoration:none;
                 " 
                 href="${baseURL}/myAccount">${baseURL}/myAccount</a>
             </div>
             </div>
         </div>`,

    //  `<p>
    //       Please check your account, as your listing for <b>${listingName}</b> expires next week.
    //       Visit
    //       <a href="${baseURL}/myAccount">here</a>
    //       to update your listing.
    //      </p>`,
  };
  sendEmail(userMailOptions);
};

module.exports = {
  findExpiringListings,
  sendReminder,
};

// if listing expires in a week, send an email to host
//   - go through all the listings
//   - check if each listing that is a week away (only one for each listing) from expiration
//   - send a mail to the user that corresponds to listing for each listing that is about to expire
//   - repeat for each listing
//   - listings that have already been sent a reminder about their expiration should not receive additional reminders
