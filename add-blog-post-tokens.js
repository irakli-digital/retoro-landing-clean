require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function addBlogPost() {
  const sql = neon(process.env.DATABASE_URL);

  const title = 'How to Save Tokens on MyPen: Smart Strategies to Maximize Your AI Usage';
  const title_ka = 'როგორ დავზოგოთ ტოკენები MyPen-ზე: ჭკვიანური სტრატეგიები თქვენი AI-ის მაქსიმალური გამოყენებისთვის';
  const slug = 'save-tokens-on-mypen';

  const excerpt = 'Make the most of your MyPen subscription with proven tips to reduce token usage without sacrificing quality.';
  const excerpt_ka = 'მიიღეთ მაქსიმუმი თქვენი MyPen-ის გამოწერიდან — გამოიყენეთ გამოცდილი მომხმარებლების რჩევები ტოკენების დასაზოგად.';

  const content = `
    <h2>Understanding Token Usage on MyPen</h2>
    <p>Before saving strategies, it helps to understand how tokens work. Like ChatGPT, MyPen counts both your input (prompts) and the AI's output. Different models have different "appetites":</p>
    <ul>
      <li><strong>MyPen LIGHT:</strong> Most economical for basic tasks.</li>
      <li><strong>MyPen PRO:</strong> Balanced performance and consumption.</li>
      <li><strong>MyPen ULTRA:</strong> Most powerful, highest token use.</li>
    </ul>

    <h2>🎯 Model Selection Strategies</h2>
    <p><strong>1. Match the model to the task</strong> — don’t use a complex model for a simple job.</p>
    <ul>
      <li><strong>LIGHT</strong> — quick questions, basic writing, translations, grammar fixes, facts.</li>
      <li><strong>PRO</strong> — creative work, analysis, debugging, research summaries, pro editing.</li>
      <li><strong>ULTRA</strong> — complex logic, long document analysis, multi-step tasks, advanced code, critical decisions.</li>
    </ul>
    <p><em>Example:</em> Use LIGHT for “What’s the capital of France?” not ULTRA.</p>

    <h2>✂️ Prompt Optimization</h2>
    <p><strong>2. Be concise but clear</strong> — extra words cost extra tokens.</p>
    <p><strong>3. Use bullet points</strong> — structure saves tokens and improves answers.</p>

    <h2>🔄 Conversation Management</h2>
    <p><strong>4. Start a new chat when changing topics</strong> — avoids unnecessary context carryover.</p>
    <p><strong>5. Ask clarifying questions step by step</strong> — often cheaper than a single huge prompt.</p>

    <h2>📝 Content Strategy</h2>
    <p><strong>6. Use templates</strong> for frequent tasks.</p>
    <p><strong>7. Ask for an outline first</strong>, then expand only the needed sections.</p>

    <h2>🔧 Technical Tricks</h2>
    <p><strong>8. Optimize file uploads</strong> — reduce size and remove unnecessary parts.</p>
    <p><strong>9. Add system instructions up front</strong> — saves clarification tokens later.</p>

    <h2>📊 Track Your Usage</h2>
    <p><strong>10. Check the usage dashboard regularly.</strong></p>
    <p><strong>11. Set goals</strong> — for free, Pro, and Ultra plans.</p>

    <h2>🚀 Advanced Techniques</h2>
    <p><strong>12. Batch similar requests</strong> into one prompt.</p>
    <p><strong>13. Include only essential context</strong> — extra details waste tokens.</p>

    <h2>💡 Power-user Tips</h2>
    <p><strong>14. Progressive detail</strong> — start general, then refine.</p>
    <p><strong>15. Use abbreviations</strong> in internal notes.</p>

    <h2>🎯 Token Budgeting</h2>
    <ul>
      <li><strong>Free:</strong> 70% core, 20% experiments, 10% reserve.</li>
      <li><strong>Pro:</strong> ~8,300 tokens/day; review weekly.</li>
      <li><strong>Ultra:</strong> Unlimited but still use efficiently.</li>
    </ul>

    <h2>🔍 Common Pitfalls</h2>
    <ul>
      <li>Repeating the same question</li>
      <li>Over-explaining simple requests</li>
      <li>Requesting overly long outputs</li>
      <li>Using a complex model for simple tasks</li>
      <li>Continuing unproductive chats</li>
    </ul>

    <h2>📈 Measuring Success</h2>
    <ul>
      <li>Tokens per task</li>
      <li>Answer quality vs. token cost</li>
      <li>Usage trends</li>
      <li>Performance vs. budget</li>
    </ul>

    <h2>Conclusion</h2>
    <p>Smart token use is about strategy: the right model for the right task, clear prompts, and efficient conversation management. Get more — with fewer tokens.</p>
    <p>The goal isn’t only to save, but to maximize the value of every token you spend.</p>
  `;

  const content_ka = `
    <h2>ტოკენების მოხმარების გაგება MyPen-ზე</h2>
    <p>სანამ დაზოგვის სტრატეგიებზე გადავალთ, მნიშვნელოვანია გვესმოდეს, როგორ მუშაობს ტოკენები ჩვენს პლატფორმაზე. ისევე როგორც ChatGPT, MyPen ითვლის ტოკენებს როგორც თქვენს შეყვანილ ტექსტზე (კითხვები/პრომპტები), ასევე AI-ის პასუხებზე (გამომავალი ინფორმაცია). სხვადასხვა მოდელს განსხვავებული „მადა“ აქვს:</p>
    <ul>
      <li><strong>MyPen LIGHT:</strong> ყველაზე ეკონომიური, იდეალურია საბაზისო ამოცანებისთვის.</li>
      <li><strong>MyPen PRO:</strong> დაბალანსებული წარმადობა და ტოკენების მოხმარება.</li>
      <li><strong>MyPen ULTRA:</strong> ყველაზე მძლავრი, მაგრამ ტოკენების ყველაზე მაღალი ხარჯით.</li>
    </ul>

    <h2>🎯 მოდელის შერჩევის სტრატეგიები</h2>
    <p><strong>1. შეურჩიეთ მოდელი ამოცანას</strong> — ნუ გამოიყენებთ რთულ მოდელს მარტივი ამოცანებისთვის.</p>
    <ul>
      <li><strong>LIGHT</strong> — მარტივი კითხვები, საბაზისო წერა, თარგმნა, სწრაფი ფაქტები, გრამატიკული შესწორებები.</li>
      <li><strong>PRO</strong> — შემოქმედებითი პროექტები, ანალიზი, კოდის გამართვა, კვლევის შეჯამება, პროფესიული რედაქტირება.</li>
      <li><strong>ULTRA</strong> — რთული ლოგიკა, დიდი დოკუმენტების ანალიზი, მრავალეტაპიანი ამოცანები, მოწინავე კოდის გენერაცია, კრიტიკული ბიზნეს გადაწყვეტილებები.</li>
    </ul>
    <p><em>მაგალითი:</em> საფრანგეთის დედაქალაქის დასადგენად გამოიყენეთ LIGHT, არა ULTRA.</p>

    <h2>✂️ პრომპტის ოპტიმიზაცია</h2>
    <p><strong>2. იყავით ლაკონური, მაგრამ ნათელი</strong> — ზედმეტი სიტყვები ზედმეტ ტოკენებს ხარჯავს.</p>
    <p><strong>3. გამოიყენეთ პუნქტები</strong> — სტრუქტურა ზოგავს ტოკენებს და აუმჯობესებს პასუხებს.</p>

    <h2>🔄 საუბრის მართვა</h2>
    <p><strong>4. თემის შეცვლისას დაიწყეთ ახალი ჩათი</strong> — თავიდან აცილებთ ზედმეტ კონტექსტს.</p>
    <p><strong>5. დასვით დამაზუსტებელი კითხვები ეტაპობრივად</strong> — ზოგჯერ ასე ნაკლები ტოკენი იხარჯება, ვიდრე ერთ გრძელ მოთხოვნაში.</p>

    <h2>📝 კონტენტის სტრატეგია</h2>
    <p><strong>6. გამოიყენეთ შაბლონები</strong> ხშირი ამოცანებისთვის.</p>
    <p><strong>7. ჯერ მოითხოვეთ გეგმა</strong>, შემდეგ გააფართოვეთ საჭირო ნაწილები.</p>

    <h2>🔧 ტექნიკური ხრიკები</h2>
    <p><strong>8. ოპტიმიზაცია ფაილების ატვირთვისას</strong> — შეამცირეთ ზომა, ამოიღეთ ზედმეტი.</p>
    <p><strong>9. გამოიყენეთ სისტემური ინსტრუქციები საუბრის დასაწყისში</strong> — ეს დაზოგავს განმარტების ტოკენებს.</p>

    <h2>📊 მოხმარების კონტროლი</h2>
    <p><strong>10. შეამოწმეთ მოხმარების პანელი რეგულარულად.</strong></p>
    <p><strong>11. დაისახეთ მიზნები</strong> — როგორც უფასო, ისე Pro/Ultra მომხმარებლებისთვის.</p>

    <h2>🚀 მოწინავე ტექნიკები</h2>
    <p><strong>12. დააჯგუფეთ მსგავსი მოთხოვნები</strong> ერთ პრომპტში.</p>
    <p><strong>13. მიაწოდეთ მხოლოდ საჭირო კონტექსტი</strong> — ზედმეტი დეტალები ტოკენების ფლანგვაა.</p>

    <h2>💡 გამოცდილი მომხმარებლების რჩევები</h2>
    <p><strong>14. პროგრესული დეტალიზაცია</strong> — დაიწყეთ ზოგადი კითხვით, შემდეგ დააზუსტეთ.</p>
    <p><strong>15. გამოიყენეთ აბრევიატურები</strong> შიდა ჩანაწერებში.</p>

    <h2>🎯 ტოკენების ბიუჯეტი</h2>
    <ul>
      <li><strong>უფასო:</strong> 70% ძირითი, 20% ექსპერიმენტი, 10% რეზერვი.</li>
      <li><strong>Pro:</strong> დღიური ლიმიტი ~8,300 ტოკენი, კვირაში მიმოხილვა.</li>
      <li><strong>Ultra:</strong> ულიმიტო, მაგრამ მაინც ეფექტიანი გამოყენება.</li>
    </ul>

    <h2>🔍 გავრცელებული ხაფანგები</h2>
    <ul>
      <li>ერთი და იგივე კითხვის რამდენჯერმე დასმა</li>
      <li>მარტივი მოთხოვნების ზედმეტად ახსნა</li>
      <li>ზედმეტად გრძელი პასუხების მოთხოვნა</li>
      <li>რთული მოდელის გამოყენება მარტივზე</li>
      <li>უშედეგო საუბრის გაგრძელება</li>
    </ul>

    <h2>📈 წარმატების გაზომვა</h2>
    <ul>
      <li>ტოკენები თითოეულ ამოცანაზე</li>
      <li>პასუხის ხარისხი ტოკენის ღირებულებასთან შედარებით</li>
      <li>მოხმარების ტენდენციები</li>
      <li>შესრულების მაჩვენებელი ბიუჯეტში</li>
    </ul>

    <h2>დასკვნა</h2>
    <p>ტოკენების ჭკვიანური გამოყენება ნიშნავს სტრატეგიულ მიდგომას: სწორი მოდელი სწორ ამოცანაზე, პრომპტის ოპტიმიზაცია და საუბრის ეფექტიანი მართვა გაძლევთ საშუალებას მიიღოთ მეტი — ნაკლები ტოკენით.</p>
    <p>მიზანი არ არის მხოლოდ დაზოგვა, არამედ თითოეული დახარჯული ტოკენის მაქსიმალური ღირებულების მიღება.</p>
  `;

  try {
    await sql`
      INSERT INTO posts (
        title, title_ka, slug, content, content_ka,
        excerpt, excerpt_ka, author, published,
        featured_image, published_at
      )
      VALUES (
        ${title}, ${title_ka}, ${slug}, ${content}, ${content_ka},
        ${excerpt}, ${excerpt_ka}, 'Mypen Team', true,
        '/images/og-image.webp', NOW()
      )
    `;

    console.log('✅ Blog post added successfully!');
    console.log('📝 Title (KA):', title_ka);
    console.log('🔗 URL: /blog/' + slug);
  } catch (error) {
    console.error('❌ Error adding blog post:', error);
  }
}

addBlogPost();
