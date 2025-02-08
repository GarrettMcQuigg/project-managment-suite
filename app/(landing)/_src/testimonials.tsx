import { Card, CardContent } from '@/packages/lib/components/card';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-16 lg:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Loved by Creatives</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Alex Johnson',
              role: 'Freelance Designer',
              content: "CreativeSuite CRM has transformed how I manage my freelance business. It's intuitive and powerful!"
            },
            {
              name: 'Sarah Lee',
              role: 'Creative Agency Owner',
              content: "This CRM understands the unique needs of creative professionals. It's a game-changer for our agency."
            },
            {
              name: 'Mike Chen',
              role: 'Photographer',
              content: 'I can focus more on my art now that CreativeSuite CRM handles the business side of things. Highly recommended!'
            }
          ].map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col space-y-2 p-6">
                <p className="text-gray-500 dark:text-gray-400">"{testimonial.content}"</p>
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-gray-300 w-10 h-10" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
