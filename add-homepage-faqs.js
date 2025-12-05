require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function addHomepageFAQs() {
  const sql = neon(process.env.DATABASE_URL);
  
  const faqs = [
    {
      question: "What is Mypen.ge?",
      question_ka: "რა არის Mypen.ge?",
      answer: "Mypen.ge is an advanced chat platform that allows you to work with various models in a unified interface. It is created for powerful, flexible and real-time work experience, with features such as file uploads, code writing and article preparation.",
      answer_ka: "Mypen.ge არის მოწინავე ჩათ-პლატფორმა, რომელიც გაძლევთ საშუალებას, ერთიან ინტერფეისში იმუშაოთ მრავალფეროვან მოდელებთან. ის შექმნილია მძლავრი, მოქნილი და რეალურ დროში მუშაობის გამოცდილებისთვის, ისეთი ფუნქციებით, როგორიცაა ფაილების ატვირთვა, კოდის წერა და სტატიების მომზადება.",
      category: "General",
      category_ka: "ზოგადი",
      sort_order: 1
    },
    {
      question: "How do I get started and is there a free version?",
      question_ka: "როგორ დავიწყო და არსებობს თუ არა უფასო ვერსია?",
      answer: "Getting started is simple. You can register for a free account to discover the platform's basic features. The free package includes daily token limits and access to AI models such as \"Mypen LIGHT\". This is the best way to try the service without any obligations.",
      answer_ka: "დაწყება მარტივია. შეგიძლიათ დარეგისტრირდეთ უფასო ანგარიშზე, რომ პლატფორმის ძირითადი ფუნქციები აღმოაჩინოთ. უფასო პაკეტი მოიცავს ტოკენების ყოველდღიურ ლიმიტს და წვდომას ისეთ AI მოდელებზე, როგორიცაა \"Mypen LIGHT\". ეს საუკეთესო გზაა, რომ სერვისი ყოველგვარი ვალდებულების გარეშე გამოსცადოთ.",
      category: "General",
      category_ka: "ზოგადი",
      sort_order: 2
    },
    {
      question: "Which AI models do I have access to on the platform?",
      question_ka: "რომელ AI მოდელებზე მაქვს წვდომა პლატფორმაზე?",
      answer: "Access to Mypen's integrated models (such as \"Mypen LIGHT\", \"Mypen PRO\", \"Mypen ULTRA\") depends on your subscription package. Upgrading to Pro or Ultra packages will give you access to our most powerful and capable models.",
      answer_ka: "პლატფორმაზე ინტეგრირებულ Mypen-ის მოდელებზე წვდომა, (როგორიცაა \"Mypen LIGHT\", \"Mypen PRO\", \"Mypen ULTRA\"), დამოკიდებულია თქვენს სააბონენტო პაკეტზე. Pro ან Ultra პაკეტზე გადასვლა გაგიხსნით წვდომას ჩვენს ყველაზე მძლავრ და დიდი შესაძლებლობების მქონე მოდელებზე.",
      category: "Subscription",
      category_ka: "გამოწერა",
      sort_order: 1
    },
    {
      question: "How does the token and subscription system work?",
      question_ka: "როგორ მუშაობს ტოკენებისა და გამოწერის სისტემა?",
      answer: "Our platform uses a dual system. The free package offers daily token limits that are renewed every 24 hours. Our paid PRO and ULTRA packages give you monthly and unlimited tokens, which are renewed every 30 days from your individual subscription date. You can track detailed usage and remaining tokens in your account settings.",
      answer_ka: "ჩვენი პლატფორმა ორმაგ სისტემას იყენებს. უფასო პაკეტი გთავაზობთ ტოკენების ყოველდღიურ ლიმიტს, რომელიც ყოველ 24 საათში ახლდება. ჩვენი ფასიანი PRO და ULTRA პაკეტები კი გაძლევთ ყოველთვიურ და შეუზღუდავ ტოკენებს, რომელიც თქვენი ინდივიდუალური გამოწერის თარიღიდან ყოველ 30 დღეში განახლდება. თქვენ შეგიძლიათ თვალი ადევნოთ დეტალურ გამოყენებასა და დარჩენილ ტოკენებს თქვენი ანგარიშის პარამეტრებში.",
      category: "Subscription",
      category_ka: "გამოწერა",
      sort_order: 2
    },
    {
      question: "Can I upload files? What file types are supported?",
      question_ka: "შემიძლია ფაილების ატვირთვა? რა ტიპის ფაილების მხარდაჭერაა?",
      answer: "Yes, you can upload various files, including images and text documents. The interface is simplified and offers \"image upload\" and \"text upload\" options. These files are processed securely and you can use them as context in your conversations, allowing AI to analyze, summarize or answer questions about their content.",
      answer_ka: "დიახ, შეგიძლიათ ატვირთოთ სხვადასხვა ფაილი, მათ შორის სურათები და ტექსტური დოკუმენტები. ინტერფეისი გამარტივებულია და გთავაზობთ \"სურათის ატვირთვის\" და \"ტექსტად ატვირთვის\" ოფციებს. ეს ფაილები უსაფრთხოდ მუშავდება და შეგიძლიათ გამოიყენოთ კონტექსტად თქვენს საუბრებში, რაც AI-ს საშუალებას აძლევს, გააანალიზოს, შეაჯამოს ან უპასუხოს კითხვებს მათი შინაარსის შესახებ.",
      category: "Features",
      category_ka: "ფუნქციები",
      sort_order: 1
    },
    {
      question: "How secure are my conversations and data?",
      question_ka: "რამდენად დაცულია ჩემი საუბრები და მონაცემები?",
      answer: "Security is our top priority. We use strong authentication methods with Passport.js and JWT tokens to protect your account. All data transmission channels are protected, and we use strict input validation and sanitization to avoid vulnerabilities. Your personal data and conversations are stored securely.",
      answer_ka: "უსაფრთხოება ჩვენი მთავარი პრიორიტეტია. თქვენი ანგარიშის დასაცავად ვიყენებთ ავთენტიფიკაციის მყარ მეთოდებს Passport.js-ითა და JWT ტოკენებით. მონაცემთა გადაცემის ყველა არხი დაცულია, ხოლო მოწყვლადობების თავიდან ასაცილებლად ვიყენებთ შეყვანის მკაცრ ვალიდაციასა და სანიტიზაციას. თქვენი პირადი მონაცემები და საუბრები უსაფრთხოდაა შენახული.",
      category: "Security",
      category_ka: "უსაფრთხოება",
      sort_order: 1
    },
    {
      question: "Is the chat experience real-time or do I have to wait for the full response?",
      question_ka: "ჩათის გამოცდილება რეალურ დროშია, თუ სრული პასუხის ლოდინი მიწევს?",
      answer: "The chat experience is designed to be fast and uninterrupted. We use Server-Sent Events (SSE) technology to stream AI responses to you as they are generated. This means you see the text part by part in real time, ensuring fast and natural conversation without long waits.",
      answer_ka: "ჩათის გამოცდილება შექმნილია, რომ იყოს სწრაფი და უწყვეტი. ჩვენ ვიყენებთ Server-Sent Events (SSE) ტექნოლოგიას, რომ AI-ს პასუხები გენერირებისთანავე გადმოგცეთ სტრიმინგით. ეს ნიშნავს, რომ ტექსტს ხედავთ ნაწილ-ნაწილ რეალურ დროში, რაც უზრუნველყოფს სწრაფ და ბუნებრივ საუბარს ხანგრძლივი ლოდინის გარეშე.",
      category: "Features",
      category_ka: "ფუნქციები",
      sort_order: 2
    },
    {
      question: "Can I create my own AI assistants?",
      question_ka: "შემიძლია საკუთარი AI ასისტენტების შექმნა?",
      answer: "Yes, Mypen.ge has support for configuring custom AI assistants and agents. This powerful feature allows you to create and manage specialized AI characters that are tailored to your specific workflows and tasks, making the platform extremely flexible and personalized.",
      answer_ka: "დიახ, Mypen.ge-ს აქვს საკუთარი AI ასისტენტებისა და აგენტების კონფიგურაციის მხარდაჭერა. ეს მძლავრი ფუნქცია გაძლევთ საშუალებას, შექმნათ და მართოთ სპეციალიზებული AI პერსონაჟები, რომლებიც მორგებული იქნება თქვენს კონკრეტულ სამუშაო პროცესებსა და ამოცანებზე, რაც პლატფორმას უაღრესად მოქნილსა და პერსონალიზებულს ხდის.",
      category: "Features",
      category_ka: "ფუნქციები",
      sort_order: 3
    },
    {
      question: "How does the payment system work for subscriptions?",
      question_ka: "როგორ მუშაობს გადახდის სისტემა გამოწერისთვის?",
      answer: "We use Flitt's payment system for secure subscription management. You can upgrade your account to Pro or Ultra packages using standard payment methods. The system automatically processes recurring monthly payments.",
      answer_ka: "გამოწერების უსაფრთხო მართვისთვის ვიყენებთ Flitt-ის გადახდის სისტემას. შეგიძლიათ თქვენი ანგარიში Pro ან Ultra პაკეტზე გადაიყვანოთ სტანდარტული გადახდის მეთოდებით. სისტემა ავტომატურად ამუშავებს განმეორებით ყოველთვიურ გადახდებს.",
      category: "Subscription",
      category_ka: "გამოწერა",
      sort_order: 3
    },
    {
      question: "Can I access my chat history from different devices?",
      question_ka: "შემიძლია ჩემი ჩათების ისტორიაზე წვდომა სხვადასხვა მოწყობილობიდან?",
      answer: "Of course. All your conversations are linked to your account and stored securely in our database. You can log in from any device - computer, tablet or mobile - and seamlessly continue the conversation or review history from exactly where you left off.",
      answer_ka: "რა თქმა უნდა. თქვენი ყველა საუბარი დაკავშირებულია თქვენს ანგარიშთან და უსაფრთხოდ ინახება ჩვენს მონაცემთა ბაზაში. შეგიძლიათ შეხვიდეთ ნებისმიერი მოწყობილობიდან - კომპიუტერი, პლანშეტი თუ მობილური - და უწყვეტად განაგრძოთ საუბარი ან გადახედოთ ისტორიას ზუსტად იმ ადგილიდან, სადაც გაჩერდით.",
      category: "General",
      category_ka: "ზოგადი",
      sort_order: 3
    }
  ];

  try {
    // First, clear existing FAQs to avoid duplicates
    await sql`DELETE FROM faqs`;
    console.log('🗑️  Cleared existing FAQs');
    
    // Insert new FAQs
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      await sql`
        INSERT INTO faqs (
          question, question_ka, answer, answer_ka,
          category, category_ka, sort_order, published
        ) VALUES (
          ${faq.question}, ${faq.question_ka}, ${faq.answer}, ${faq.answer_ka},
          ${faq.category}, ${faq.category_ka}, ${faq.sort_order}, true
        )
      `;
      console.log(`✅ Added FAQ ${i + 1}: ${faq.question_ka}`);
    }
    
    console.log('');
    console.log(`🎉 Successfully added ${faqs.length} FAQs from homepage!`);
    console.log('📂 Categories created:');
    console.log('   - ზოგადი (General)');
    console.log('   - გამოწერა (Subscription)');
    console.log('   - ფუნქციები (Features)');
    console.log('   - უსაფრთხოება (Security)');
    console.log('');
    console.log('🔗 View FAQs at: /faq');
    
  } catch (error) {
    console.error('❌ Error adding FAQs:', error);
  }
}

addHomepageFAQs();