
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, FileText, Shield, Zap, Users, Globe, Star, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const Landing = () => {
  const features = [
    {
      icon: FileText,
      title: "Contratos Inteligentes",
      description: "Crie contratos profissionais com modelos personalizáveis e variáveis dinâmicas"
    },
    {
      icon: Shield,
      title: "Assinatura Digital",
      description: "Assinatura eletrônica com certificado digital e validade jurídica"
    },
    {
      icon: Zap,
      title: "Automação Completa",
      description: "Workflow automatizado desde a criação até a assinatura do contrato"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Centralize todos os seus clientes e histórico de contratos em um só lugar"
    },
    {
      icon: Globe,
      title: "Integração API",
      description: "Conecte com seus sistemas existentes através da nossa API robusta"
    }
  ]

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar",
      features: [
        "3 contratos por mês",
        "Modelos básicos",
        "Assinatura eletrônica",
        "Suporte por email"
      ],
      highlighted: false
    },
    {
      name: "Profissional",
      price: "R$ 29,90",
      period: "/mês",
      description: "Para freelancers e PMEs",
      features: [
        "50 contratos por mês",
        "Todos os modelos",
        "Customização avançada",
        "Relatórios básicos",
        "Suporte prioritário",
        "Integração FinanceFlow"
      ],
      highlighted: true
    },
    {
      name: "Premium",
      price: "R$ 79,90",
      period: "/mês", 
      description: "Para empresas e agências",
      features: [
        "Contratos ilimitados",
        "API completa",
        "Webhooks",
        "Relatórios avançados",
        "Suporte dedicado",
        "White-label",
        "Integração FinanceFlow Pro"
      ],
      highlighted: false
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Fotógrafa Profissional",
      content: "O ContratPro revolucionou minha forma de trabalhar. Agora meus contratos são enviados e assinados em minutos!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Diretor de Agência",
      content: "A integração com nossos sistemas foi perfeita. Economizamos horas de trabalho toda semana.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Consultora Freelancer",
      content: "Interface intuitiva e funcionalidades incríveis. Recomendo para todos os profissionais!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ContratPro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-700">
          Novo: Integração com FinanceFlow
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Contratos Digitais
          <span className="block text-blue-600">Sem Complicação</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Crie, envie e gerencie contratos profissionais com assinatura digital válida. 
          Automatize seu fluxo de trabalho e foque no que realmente importa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3">
            Ver Demonstração
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Sem cartão de crédito • Configuração em 2 minutos
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas poderosas para profissionais que levam seus contratos a sério
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-xl text-gray-600">
            Escolha o plano ideal para o tamanho do seu negócio
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border-0 shadow-lg ${
              plan.highlighted ? 'ring-2 ring-blue-600 shadow-2xl scale-105' : ''
            }`}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="block mt-8">
                  <Button 
                    className={`w-full ${
                      plan.highlighted 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para revolucionar seus contratos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de profissionais que já automatizaram seus processos
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Começar Grátis Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span className="text-xl font-bold">ContratPro</span>
            </div>
            <p className="text-gray-400">
              © 2024 ContratPro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
