import { useState } from 'react'
import { Upload, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface VendorExperienceFormProps {
  onBack: () => void
  onSave: (data: any) => void
}

export function VendorExperienceForm({ onBack, onSave }: VendorExperienceFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [groupSize, setGroupSize] = useState({ min: 1, max: 10 })
  const [images, setImages] = useState<string[]>([])
  const [included, setIncluded] = useState<string[]>([])
  const [newIncludedItem, setNewIncludedItem] = useState('')

  const handleAddIncluded = () => {
    if (newIncludedItem.trim()) {
      setIncluded([...included, newIncludedItem.trim()])
      setNewIncludedItem('')
    }
  }

  const handleRemoveIncluded = (index: number) => {
    setIncluded(included.filter((_, i) => i !== index))
  }

  const handleImageUpload = () => {
    const mockUrl = `https://images.unsplash.com/photo-${Date.now()}?w=800`
    setImages([...images, mockUrl])
    toast.success('Image uploaded')
  }

  const handleSave = () => {
    if (!title || !category || !description || !price || !duration) {
      toast.error('Please fill in all required fields')
      return
    }

    const experienceData = {
      title,
      category,
      description,
      price: parseFloat(price),
      duration,
      groupSize,
      images,
      included,
    }

    onSave(experienceData)
    toast.success('Experience created successfully')
    onBack()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Cancel
          </Button>
          <h1 className="font-display text-xl font-semibold">Create Experience</h1>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="container max-w-3xl space-y-6 py-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Sunrise Yoga at Tanah Lot Temple"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water_adventures">Water Adventures</SelectItem>
                  <SelectItem value="land_excursions">Land Excursions</SelectItem>
                  <SelectItem value="cultural_experiences">Cultural Experiences</SelectItem>
                  <SelectItem value="food_tours">Food & Culinary</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your experience in detail..."
                rows={6}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="2 hours"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minGroup">Min Group Size</Label>
                <Input
                  id="minGroup"
                  type="number"
                  value={groupSize.min}
                  onChange={(e) => setGroupSize({ ...groupSize, min: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGroup">Max Group Size</Label>
                <Input
                  id="maxGroup"
                  type="number"
                  value={groupSize.max}
                  onChange={(e) => setGroupSize({ ...groupSize, max: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Images</Label>
              <div className="mt-2 grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="aspect-square"
                  onClick={handleImageUpload}
                >
                  <Upload className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div>
              <Label>What's Included</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={newIncludedItem}
                  onChange={(e) => setNewIncludedItem(e.target.value)}
                  placeholder="Add an included item"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIncluded()}
                />
                <Button onClick={handleAddIncluded}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {included.map((item, index) => (
                  <Badge key={index} variant="secondary">
                    {item}
                    <button
                      className="ml-2"
                      onClick={() => handleRemoveIncluded(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
