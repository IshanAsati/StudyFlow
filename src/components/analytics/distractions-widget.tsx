import { useDistractionStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DistractionsWidget() {
  const { distractions, resetDistractions } = useDistractionStore()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Distractions Today</CardTitle>
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{distractions}</p>
            <p className="text-xs text-muted-foreground">Tab switches or idle</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetDistractions}
          >
            <RefreshCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
