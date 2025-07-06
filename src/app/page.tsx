import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Map, PenTool, Network, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">SageMap</h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-4">
            Discover, map, and evolve your belief system over time with AI-powered introspection
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/journal">
              <Button size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                <PenTool className="w-5 h-5" />
                Start Journaling
              </Button>
            </Link>
            <Link href="/graph">
              <Button variant="outline" size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                <Network className="w-5 h-5" />
                View Belief Graph
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI-Powered Extraction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Write naturally about your thoughts and experiences.
                GPT-4o intelligently extracts your belief statements with confidence levels.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-green-600" />
                Interactive Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Visualize your beliefs as an interconnected network.
                See how your ideas relate, contradict, or reinforce each other.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Evolution Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track how your beliefs evolve over time.
                AI detects when new beliefs refine or contradict your existing ones.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-orange-600" />
                Belief Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Organize beliefs into core values, assumptions, and derived conclusions.
                Understand the foundation of your thinking.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your beliefs are stored locally.
                Export your data anytime or delete everything with one click.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-600" />
                Guided Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get AI-generated questions to explore your belief system deeper
                and uncover hidden assumptions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">How SageMap Works</h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Write & Reflect</h3>
              <p className="text-gray-600 text-sm">
                Journal about your thoughts, experiences, and perspectives.
                No special format needed - just write naturally.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                GPT-4o extracts your beliefs, categorizes them, and identifies
                relationships with your existing belief system.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Explore & Evolve</h3>
              <p className="text-gray-600 text-sm">
                Visualize your belief network, discover contradictions,
                and track how your thinking evolves over time.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Map Your Beliefs?</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto px-4">
            Start your journey of self-discovery and build a deeper understanding
            of your belief system.
          </p>
          <div className="space-y-4">
            <Link href="/journal">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                <PenTool className="w-5 h-5" />
                Begin Your First Entry
              </Button>
            </Link>
            <p className="text-xs text-gray-500 max-w-lg mx-auto mt-4 px-4">
              💡 Tip: Add your own OpenAI API key in settings to make it work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
