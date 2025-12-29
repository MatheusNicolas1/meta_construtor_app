import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface AutocompleteInputProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: string[]
  onAddNewOption?: (option: string) => void
  disabled?: boolean
  className?: string
}

export function AutocompleteInput({
  value = "",
  onValueChange,
  placeholder,
  options,
  onAddNewOption,
  disabled,
  className,
}: AutocompleteInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options
    return options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [options, inputValue])

  const isExactMatch = options.some(option => 
    option.toLowerCase() === inputValue.toLowerCase()
  )

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue)
    onValueChange?.(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onValueChange?.(newValue)
    setOpen(true)
  }

  const handleAddNew = () => {
    if (inputValue && !isExactMatch) {
      onAddNewOption?.(inputValue)
      setOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue && !isExactMatch) {
      e.preventDefault()
      handleAddNew()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            onFocus={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="w-full">
          <CommandList>
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {inputValue && !isExactMatch && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleAddNew}
                  className="cursor-pointer font-medium text-primary"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Adicionar "{inputValue}"
                </CommandItem>
              </CommandGroup>
            )}
            {filteredOptions.length === 0 && inputValue && isExactMatch && (
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            )}
            {filteredOptions.length === 0 && !inputValue && (
              <CommandEmpty>Digite para buscar ou criar uma nova opção.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}